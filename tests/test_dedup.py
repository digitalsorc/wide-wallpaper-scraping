from pathlib import Path

from PIL import Image

from wallpaperbot.dedup import compute_phash, compute_sha256, is_duplicate


def test_hash_and_duplicate(tmp_path: Path):
    img_path = tmp_path / "sample.png"
    Image.new("RGB", (100, 50), color="red").save(img_path)
    data = img_path.read_bytes()
    sha = compute_sha256(data)
    phash = compute_phash(img_path)

    assert len(sha) == 64
    assert phash is not None
    assert is_duplicate({sha}, sha, phash)