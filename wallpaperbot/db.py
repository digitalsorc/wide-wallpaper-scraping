"""SQLite persistence layer."""

from __future__ import annotations

import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Iterable, Optional

from .models import DownloadInfo


SCHEMA = """
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    source_page_url TEXT NOT NULL,
    direct_url TEXT,
    title TEXT,
    author TEXT,
    license TEXT,
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    sha256 TEXT NOT NULL UNIQUE,
    phash TEXT,
    file_path TEXT NOT NULL,
    suitability TEXT,
    suitability_reason TEXT,
    downloaded_at TEXT,
    query TEXT
);
"""


class Database:
    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(self.path)
        self.conn.execute("PRAGMA journal_mode=WAL;")
        self.conn.execute(SCHEMA)
        self.conn.commit()

    def close(self) -> None:
        self.conn.close()

    def record_download(self, info: DownloadInfo, query: Optional[str] = None) -> None:
        self.conn.execute(
            """
            INSERT OR IGNORE INTO images (
                source, source_page_url, direct_url, title, author, license, width,
                height, file_size, sha256, phash, file_path, suitability,
                suitability_reason, downloaded_at, query
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                info.candidate.source,
                info.candidate.source_page_url,
                info.candidate.direct_url,
                info.candidate.title,
                info.candidate.author,
                info.candidate.license,
                info.width,
                info.height,
                info.file_size,
                info.sha256,
                info.phash,
                str(info.file_path),
                info.suitability,
                info.suitability_reason,
                info.downloaded_at.isoformat(),
                query,
            ),
        )
        self.conn.commit()

    def existing_hashes(self) -> set[str]:
        cur = self.conn.execute("SELECT sha256, COALESCE(phash, '') FROM images")
        hashes: set[str] = set()
        for sha, ph in cur.fetchall():
            if sha:
                hashes.add(sha)
            if ph:
                hashes.add(ph)
        return hashes

    def list_recent(self, limit: int = 10) -> Iterable[tuple[str, str]]:
        cur = self.conn.execute(
            "SELECT file_path, downloaded_at FROM images ORDER BY downloaded_at DESC LIMIT ?",
            (limit,),
        )
        return cur.fetchall()

    def count(self) -> int:
        cur = self.conn.execute("SELECT COUNT(*) FROM images")
        row = cur.fetchone()
        return int(row[0]) if row else 0

    def suitability_counts(self) -> dict[str, int]:
        cur = self.conn.execute("SELECT suitability, COUNT(*) FROM images GROUP BY suitability")
        return {row[0] or "unknown": row[1] for row in cur.fetchall()}