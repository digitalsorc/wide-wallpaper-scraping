from wallpaperbot.image_ops import evaluate_suitability


def test_perfect_match():
    res = evaluate_suitability((5760, 1080), (5760, 1080))
    assert res.category == "perfect"
    assert res.score == 1.0


def test_croppable_when_larger():
    res = evaluate_suitability((7000, 1300), (5760, 1080), tolerance=0.2, allow_crop=True)
    assert res.category == "croppable"


def test_reject_small_image():
    res = evaluate_suitability((1000, 800), (5760, 1080), allow_upscale=False)
    assert res.category == "reject"