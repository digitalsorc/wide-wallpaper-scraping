"""Deduplication utilities."""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Optional

import imagehash
from PIL import Image


def compute_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def compute_phash(path: Path) -> Optional[str]:
    try:
        with Image.open(path) as img:
            return str(imagehash.phash(img))
    except Exception:
        return None


def is_duplicate(existing_hashes: set[str], sha256: str, phash: Optional[str]) -> bool:
    if sha256 in existing_hashes:
        return True
    return phash is not None and phash in existing_hashes