"""Robots.txt compliance helpers."""

from __future__ import annotations

from functools import lru_cache
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser


@lru_cache(maxsize=64)
def can_fetch(url: str, user_agent: str = "wallpaperbot") -> bool:
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    parser = RobotFileParser()
    try:
        parser.set_url(robots_url)
        parser.read()
        return parser.can_fetch(user_agent, url)
    except Exception:
        return False