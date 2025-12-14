"""Adapter base classes."""

from __future__ import annotations

import abc
from typing import Iterable, List

from ..models import Candidate


class SourceAdapter(abc.ABC):
    name: str

    @abc.abstractmethod
    async def discover(self, query: str, page_limit: int) -> List[Candidate]:
        ...

    @abc.abstractmethod
    async def resolve(self, candidate: Candidate) -> Candidate:
        ...

    def note_unsupported(self, reason: str) -> List[Candidate]:
        return [
            Candidate(
                id=f"unsupported-{self.name}",
                source=self.name,
                title=f"{self.name} unsupported",
                source_page_url="https://example.com",
                unsupported_reason=reason,
            )
        ]