"""Shared models for wallpaper metadata."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional


@dataclass
class Candidate:
    id: str
    source: str
    title: str
    source_page_url: str
    direct_url: Optional[str] = None
    author: Optional[str] = None
    license: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    tags: tuple[str, ...] = ()
    unsupported_reason: Optional[str] = None


@dataclass
class DownloadInfo:
    candidate: Candidate
    file_path: Path
    sha256: str
    phash: Optional[str]
    width: int
    height: int
    file_size: int
    suitability: str
    suitability_reason: str
    downloaded_at: datetime