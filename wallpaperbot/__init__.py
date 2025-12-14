"""WallpaperBot package initialization."""

from .config import Config, load_config
from .cli import app

__all__ = ["Config", "load_config", "app"]