from pathlib import Path

import yaml

from wallpaperbot.config import Config, load_config


def test_load_config_from_yaml(tmp_path: Path):
    cfg_file = tmp_path / "config.yaml"
    yaml.safe_dump(
        {
            "monitor_count": 3,
            "monitor_width": 2560,
            "monitor_height": 1440,
            "unsplash_access_key": "abc",
        },
        cfg_file.open("w", encoding="utf-8"),
    )
    cfg = load_config(cfg_file)
    assert cfg.monitor_width == 2560
    assert cfg.target_resolution == (7680, 1440)
    assert cfg.unsplash_access_key == "abc"


def test_default_config_env_override(monkeypatch):
    monkeypatch.setenv("UNSPLASH_ACCESS_KEY", "envkey")
    cfg = load_config(None)
    assert cfg.unsplash_access_key == "envkey"