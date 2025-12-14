"""Source adapters for wallpaperbot."""

from .unsplash import UnsplashAdapter
from .stub_sources import build_default_stub_adapters

__all__ = ["UnsplashAdapter", "build_default_stub_adapters"]