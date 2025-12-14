"""Cross-platform wallpaper setting utilities."""

from __future__ import annotations

import os
import platform
import subprocess
from pathlib import Path


class WallpaperSetError(Exception):
    pass


def set_wallpaper(path: Path) -> str:
    system = platform.system().lower()
    if system == "windows":
        return _set_windows(path)
    if system == "darwin":
        return _set_macos(path)
    if system == "linux":
        return _set_linux(path)
    raise WallpaperSetError(f"Unsupported OS: {system}")


def _set_windows(path: Path) -> str:
    import ctypes

    SPI_SETDESKWALLPAPER = 20
    try:
        result = ctypes.windll.user32.SystemParametersInfoW(
            SPI_SETDESKWALLPAPER, 0, str(path), 3
        )
        if not result:
            raise WallpaperSetError("SystemParametersInfoW failed")
        return "Wallpaper set via SystemParametersInfoW"
    except Exception as exc:  # pragma: no cover - platform specific
        raise WallpaperSetError(str(exc))


def _set_macos(path: Path) -> str:
    script = f'''osascript -e 'tell application "System Events" to set picture of every desktop to "{path}"'
    '''
    try:
        subprocess.check_call(script, shell=True)
        return "Wallpaper set via AppleScript"
    except subprocess.CalledProcessError as exc:  # pragma: no cover - platform specific
        raise WallpaperSetError(str(exc))


def _set_linux(path: Path) -> str:
    # Attempt GNOME via gsettings
    if os.environ.get("XDG_CURRENT_DESKTOP", "").lower().startswith("gnome"):
        try:
            subprocess.check_call(
                [
                    "gsettings",
                    "set",
                    "org.gnome.desktop.background",
                    "picture-uri",
                    f"file://{path}",
                ]
            )
            return "Wallpaper set via gsettings"
        except subprocess.CalledProcessError as exc:  # pragma: no cover - platform specific
            raise WallpaperSetError(str(exc))
    raise WallpaperSetError("Unsupported Linux desktop; please set manually")