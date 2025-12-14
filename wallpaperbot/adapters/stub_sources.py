"""Placeholder adapters for sources that disallow automation."""

from __future__ import annotations

from typing import List

from ..models import Candidate
from ..robots import can_fetch
from .base import SourceAdapter


class DisallowedAdapter(SourceAdapter):
    def __init__(self, name: str, homepage: str, reason: str):
        self.name = name
        self.homepage = homepage
        self.reason = reason

    async def discover(self, query: str, page_limit: int) -> List[Candidate]:
        allowed = can_fetch(self.homepage)
        reason = self.reason if not allowed else self.reason
        return [
            Candidate(
                id=f"{self.name}-unsupported",
                source=self.name,
                title=f"{self.name} unsupported",
                source_page_url=self.homepage,
                unsupported_reason=reason,
            )
        ]

    async def resolve(self, candidate: Candidate) -> Candidate:
        return candidate


def build_default_stub_adapters() -> list[SourceAdapter]:
    return [
        DisallowedAdapter(
            "ultrawidewallpapers",
            "https://ultrawidewallpapers.net",
            "Terms restrict automated tools/bots; manual downloads required",
        ),
        DisallowedAdapter(
            "4kwallpapers",
            "https://4kwallpapers.com",
            "ToS prohibits automated access and hotlinking",
        ),
        DisallowedAdapter(
            "wallpapers.com",
            "https://wallpapers.com",
            "Site uses aggressive anti-bot and fair-use limits; automation skipped",
        ),
        DisallowedAdapter(
            "wallpapersafari",
            "https://wallpapersafari.com",
            "ToS forbids automated scripts; only human browsing allowed",
        ),
        DisallowedAdapter(
            "wallpaperfusion",
            "https://www.wallpaperfusion.com",
            "Requires account and ToS discourages scraping; use apps instead",
        ),
        DisallowedAdapter(
            "wallpaperswide",
            "https://wallpaperswide.com",
            "ToS blocks automated downloads/hotlinking",
        ),
        DisallowedAdapter(
            "triplemonitorbackgrounds",
            "https://triplemonitorbackgrounds.com",
            "Community site without API; scraping would violate fair use",
        ),
    ]