"""Unsplash adapter using official API."""

from __future__ import annotations

import asyncio
from typing import List

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from ..config import Config
from ..models import Candidate
from .base import SourceAdapter


class UnsplashAdapter(SourceAdapter):
    name = "unsplash"

    def __init__(self, config: Config):
        if not config.unsplash_access_key:
            raise ValueError("UNSPLASH_ACCESS_KEY is required for Unsplash adapter")
        self.config = config
        self._client = httpx.AsyncClient(timeout=15, headers={"User-Agent": "wallpaperbot"})

    @retry(wait=wait_exponential(multiplier=1, min=1, max=8), stop=stop_after_attempt(3))
    async def _get(self, url: str, params: dict) -> httpx.Response:
        resp = await self._client.get(
            url,
            params={**params, "client_id": self.config.unsplash_access_key},
        )
        resp.raise_for_status()
        return resp

    async def discover(self, query: str, page_limit: int) -> List[Candidate]:
        tasks = []
        for page in range(1, page_limit + 1):
            tasks.append(self._fetch_page(query, page))
        results: List[List[Candidate]] = await asyncio.gather(*tasks)
        combined: List[Candidate] = []
        for res in results:
            combined.extend(res)
        return combined

    async def _fetch_page(self, query: str, page: int) -> List[Candidate]:
        data = (await self._get(
            "https://api.unsplash.com/search/photos",
            {"query": query, "page": page, "per_page": 10},
        )).json()
        candidates: List[Candidate] = []
        for item in data.get("results", []):
            candidates.append(
                Candidate(
                    id=item["id"],
                    source=self.name,
                    title=item.get("alt_description") or item.get("description") or "unsplash",
                    source_page_url=item.get("links", {}).get("html", "https://unsplash.com"),
                    direct_url=item.get("urls", {}).get("raw"),
                    author=(item.get("user") or {}).get("name"),
                    license="Unsplash License",
                    width=item.get("width"),
                    height=item.get("height"),
                    tags=tuple(t.get("title", "") for t in item.get("tags", []) if t.get("title")),
                )
            )
        return candidates

    async def resolve(self, candidate: Candidate) -> Candidate:
        return candidate

    async def aclose(self) -> None:
        await self._client.aclose()