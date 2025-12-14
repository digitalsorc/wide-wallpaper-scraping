"""Configuration management for WallpaperBot."""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import os
import yaml
from pydantic import BaseModel, Field
from platformdirs import user_config_path


class Config(BaseModel):
    """Runtime configuration values."""

    monitor_count: int = Field(3, description="Number of monitors")
    monitor_width: int = Field(1920, description="Per-monitor width")
    monitor_height: int = Field(1080, description="Per-monitor height")
    tolerance: float = Field(0.1, description="Aspect ratio tolerance (fraction)")
    allow_crop: bool = Field(True, description="Allow center cropping of oversized images")
    allow_upscale: bool = Field(False, description="Allow upscaling smaller images")
    output_dir: Path = Field(Path("wallpaper-library"), description="Output directory")
    database_path: Path = Field(
        Path("wallpaper-library") / "wallpaperbot.db",
        description="SQLite database path",
    )
    rate_limit_rps: float = Field(1.0, description="Global requests-per-second limit")
    concurrency: int = Field(4, description="Max concurrent HTTP requests")
    page_limit: int = Field(3, description="Default page limit per source")
    unsplash_access_key: Optional[str] = Field(
        default=None, description="Unsplash API access key"
    )
    allow_playwright: bool = Field(False, description="Allow Playwright for JS-heavy sites")

    class Config:
        arbitrary_types_allowed = True

    @property
    def target_resolution(self) -> tuple[int, int]:
        return (self.monitor_width * self.monitor_count, self.monitor_height)


DEFAULT_CONFIG = Config()


def default_config_path() -> Path:
    base = user_config_path("wallpaperbot", "digitalsorc")
    return base / "config.yaml"


def load_config(path: Optional[Path] = None) -> Config:
    cfg_path = path or default_config_path()
    if cfg_path.exists():
        with cfg_path.open("r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        return Config(**data)
    # Fall back to env overrides if present
    overrides = {}
    if "UNSPLASH_ACCESS_KEY" in os.environ:
        overrides["unsplash_access_key"] = os.environ["UNSPLASH_ACCESS_KEY"]
    if "WALLPAPERBOT_OUTPUT_DIR" in os.environ:
        overrides["output_dir"] = Path(os.environ["WALLPAPERBOT_OUTPUT_DIR"])
    if "WALLPAPERBOT_DB_PATH" in os.environ:
        overrides["database_path"] = Path(os.environ["WALLPAPERBOT_DB_PATH"])
    return Config(**overrides)


def write_default_config(path: Optional[Path] = None) -> Path:
    cfg_path = path or default_config_path()
    cfg_path.parent.mkdir(parents=True, exist_ok=True)
    with cfg_path.open("w", encoding="utf-8") as f:
        yaml.safe_dump(DEFAULT_CONFIG.model_dump(), f, sort_keys=False)
    return cfg_path