"""Image suitability scoring and transformations."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Tuple


@dataclass
class SuitabilityResult:
    category: str
    score: float
    reason: str


def aspect_ratio(width: int, height: int) -> float:
    return width / height


def within_tolerance(value: float, target: float, tolerance: float) -> bool:
    return abs(value - target) <= target * tolerance


def evaluate_suitability(
    img_size: Tuple[int, int],
    target_size: Tuple[int, int],
    tolerance: float = 0.1,
    allow_crop: bool = True,
    allow_upscale: bool = False,
) -> SuitabilityResult:
    iw, ih = img_size
    tw, th = target_size
    if iw <= 0 or ih <= 0:
        return SuitabilityResult("reject", 0.0, "Invalid dimensions")

    image_ar = aspect_ratio(iw, ih)
    target_ar = aspect_ratio(tw, th)

    if iw >= tw and ih >= th and within_tolerance(image_ar, target_ar, tolerance):
        return SuitabilityResult("perfect", 1.0, "Matches target within tolerance")

    if iw >= tw and ih >= th and allow_crop:
        # Oversized but can be cropped to fit
        return SuitabilityResult("croppable", 0.8, "Larger than target; center-crop possible")

    if allow_upscale and within_tolerance(image_ar, target_ar, tolerance):
        return SuitabilityResult("upscalable", 0.4, "Below target but aspect ratio matches")

    return SuitabilityResult("reject", 0.0, "Insufficient resolution or mismatched ratio")