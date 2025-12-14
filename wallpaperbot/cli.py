"""WallpaperBot command-line interface."""

from __future__ import annotations

import asyncio
import json
from io import BytesIO
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import httpx
import typer
from PIL import Image
from rich.console import Console
from rich.table import Table

from .adapters.stub_sources import build_default_stub_adapters
from .adapters.unsplash import UnsplashAdapter
from .config import Config, load_config, write_default_config
from .db import Database
from .dedup import compute_sha256, is_duplicate
from .image_ops import evaluate_suitability
from .models import Candidate, DownloadInfo
from .utils import human_size, setup_logging
from .wallpaper_setter import WallpaperSetError, set_wallpaper

app = typer.Typer(help="Wallpaper downloader/manager for triple-monitor setups")
console = Console()


def build_adapters(config: Config, source: Optional[str]) -> List:
    adapters = []
    if source in (None, "unsplash") and config.unsplash_access_key:
        try:
            adapters.append(UnsplashAdapter(config))
        except ValueError:
            pass
    # Stub adapters for other sites to document restrictions
    if source is None:
        adapters.extend(build_default_stub_adapters())
    return adapters


def candidate_filename(candidate: Candidate) -> str:
    stem = candidate.title.replace(" ", "-") if candidate.title else candidate.id
    return f"{candidate.id}-{stem}.jpg"


async def download_candidate(
    client: httpx.AsyncClient,
    candidate: Candidate,
    cfg: Config,
    output_dir: Path,
    existing_hashes: set[str],
) -> Optional[DownloadInfo]:
    if not candidate.direct_url:
        return None
    resp = await client.get(candidate.direct_url)
    resp.raise_for_status()
    data = resp.content
    sha256 = compute_sha256(data)
    if is_duplicate(existing_hashes, sha256, None):
        return None

    with Image.open(BytesIO(data)) as img:
        width, height = img.size
        suitability = evaluate_suitability(
            (width, height),
            cfg.target_resolution,
            cfg.tolerance,
            cfg.allow_crop,
            cfg.allow_upscale,
        )

    if suitability.category == "reject":
        return None

    target_dir = output_dir / candidate.source
    target_dir.mkdir(parents=True, exist_ok=True)
    file_path = target_dir / candidate_filename(candidate)
    file_path.write_bytes(data)

    # Compute phash after saving for consistency
    with Image.open(file_path) as img_for_hash:
        from imagehash import phash

        phash_value = str(phash(img_for_hash))

    info = DownloadInfo(
        candidate=candidate,
        file_path=file_path,
        sha256=sha256,
        phash=phash_value,
        width=width,
        height=height,
        file_size=len(data),
        suitability=suitability.category,
        suitability_reason=suitability.reason,
        downloaded_at=datetime.utcnow(),
    )
    meta_path = file_path.with_suffix(".json")
    meta_path.write_text(
        json.dumps(
            {
                "source": candidate.source,
                "source_page_url": candidate.source_page_url,
                "direct_url": candidate.direct_url,
                "author": candidate.author,
                "license": candidate.license,
                "width": width,
                "height": height,
                "tags": candidate.tags,
                "suitability": suitability.category,
                "reason": suitability.reason,
            },
            indent=2,
        )
    )
    existing_hashes.add(sha256)
    if phash_value:
        existing_hashes.add(phash_value)
    return info


@app.command()
def init(config_path: Optional[Path] = typer.Option(None, help="Path to config.yaml")) -> None:
    """Create a default configuration file."""

    cfg_path = write_default_config(config_path)
    console.print(f"Config written to {cfg_path}")


@app.command()
def fetch(
    query: str = typer.Option(..., help="Search query"),
    limit: int = typer.Option(20, help="Max wallpapers to download"),
    source: Optional[str] = typer.Option(None, help="Specific source (unsplash, etc.)"),
    page_limit: int = typer.Option(None, help="Pages per source"),
    config: Optional[Path] = typer.Option(None, help="Config path"),
    output_dir: Optional[Path] = typer.Option(None, help="Override output directory"),
    dry_run: bool = typer.Option(False, help="Do not download, only list"),
) -> None:
    cfg = load_config(config)
    if output_dir:
        cfg.output_dir = output_dir
    if page_limit:
        cfg.page_limit = page_limit

    setup_logging()
    adapters = build_adapters(cfg, source)
    if not adapters:
        console.print("No adapters available. Set UNSPLASH_ACCESS_KEY or choose supported source.")
        raise typer.Exit(code=1)

    db = Database(cfg.database_path)
    existing_hashes = db.existing_hashes()
    downloaded: List[DownloadInfo] = []

    async def runner() -> None:
        async with httpx.AsyncClient(timeout=20, headers={"User-Agent": "wallpaperbot"}) as client:
            for adapter in adapters:
                candidates = await adapter.discover(query, cfg.page_limit)
                for cand in candidates:
                    if cand.unsupported_reason:
                        console.print(f"[yellow]{cand.source}: {cand.unsupported_reason}[/yellow]")
                        continue
                    if dry_run:
                        console.print(f"[cyan]Would download[/cyan] {cand.title} from {cand.source}")
                        continue
                    try:
                        info = await download_candidate(client, cand, cfg, cfg.output_dir, existing_hashes)
                        if info:
                            db.record_download(info, query=query)
                            downloaded.append(info)
                            console.print(
                                f"[green]Saved[/green] {info.file_path.name} "
                                f"{info.width}x{info.height} {human_size(info.file_size)} "
                                f"({info.suitability})"
                            )
                            if len(downloaded) >= limit:
                                return
                    except Exception as exc:  # pragma: no cover - network dependent
                        console.print(f"[red]Failed[/red] {cand.title}: {exc}")

    asyncio.run(runner())
    console.print(f"Downloaded {len(downloaded)} images. DB total: {db.count()}")


@app.command()
def curate(
    min_width: int = typer.Option(6000, help="Minimum width for curation"),
    config: Optional[Path] = typer.Option(None, help="Config path"),
) -> None:
    """Create a curated folder with suitable images."""

    cfg = load_config(config)
    curated_dir = cfg.output_dir / "curated"
    curated_dir.mkdir(parents=True, exist_ok=True)
    db = Database(cfg.database_path)
    copied = 0
    cur = db.conn.execute(
        "SELECT file_path, width, height, suitability FROM images WHERE width >= ?",
        (min_width,),
    )
    for file_path, width, height, suitability in cur.fetchall():
        src = Path(file_path)
        if not src.exists():
            continue
        dest = curated_dir / src.name
        dest.write_bytes(src.read_bytes())
        copied += 1
    console.print(f"Curated {copied} images into {curated_dir}")


@app.command()
def set(
    latest: bool = typer.Option(True, help="Set the most recent download"),
    path: Optional[Path] = typer.Option(None, help="Specific image path"),
    config: Optional[Path] = typer.Option(None, help="Config path"),
) -> None:
    cfg = load_config(config)
    target: Optional[Path] = path
    db = Database(cfg.database_path)
    if latest and not target:
        recents = list(db.list_recent(1))
        if recents:
            target = Path(recents[0][0])
    if not target:
        console.print("No image found to set")
        raise typer.Exit(code=1)
    try:
        result = set_wallpaper(target)
        console.print(f"Wallpaper set: {result}")
    except WallpaperSetError as exc:  # pragma: no cover - platform specific
        console.print(f"[red]{exc}[/red]")


@app.command()
def doctor(config: Optional[Path] = typer.Option(None, help="Config path")) -> None:
    """Run environment checks."""

    cfg = load_config(config)
    table = Table(title="Doctor")
    table.add_column("Check")
    table.add_column("Status")
    table.add_column("Details")

    exists_output = cfg.output_dir.exists()
    table.add_row("Output dir", "OK" if exists_output else "WARN", str(cfg.output_dir))

    unsplash = "OK" if cfg.unsplash_access_key else "MISSING"
    table.add_row("Unsplash key", unsplash, "UNSPLASH_ACCESS_KEY env or config")

    db_path = cfg.database_path
    table.add_row("Database", "OK" if db_path.exists() else "NEW", str(db_path))

    console.print(table)


@app.command()
def report(config: Optional[Path] = typer.Option(None, help="Config path")) -> None:
    cfg = load_config(config)
    db = Database(cfg.database_path)
    table = Table(title="Library Report")
    table.add_column("Metric")
    table.add_column("Value")
    table.add_row("Total images", str(db.count()))
    for key, value in db.suitability_counts().items():
        table.add_row(f"{key}", str(value))
    console.print(table)
