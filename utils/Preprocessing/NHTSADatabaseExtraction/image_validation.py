"""Image validation helpers shared by NHTSA and CIREN extraction flows."""

from pathlib import Path
from typing import Any, Dict, List

import cv2

from configurations import PHOTO_TEXT_LABELS
from utils.Preprocessing.ImagesExtractionClassification.photo_classifier import get_photo_clip_context
from utils.Preprocessing.ImagesExtractionClassification.photo_classifier import is_photograph
from utils.Preprocessing.ImagesExtractionClassification.yolo_classifier import classify_cars_image
from utils.Preprocessing.ImagesExtractionClassification.yolo_classifier import classify_damages_image
from utils.Preprocessing.NHTSADatabaseExtraction.storage_utils import delete_file_if_exists

# Lazily initialized CLIP resources shared across NHTSA image validation.
_PHOTO_CLIP_CONTEXT = None


def _get_nhtsa_photo_clip_context() -> Dict[str, Any]:
    """Build and cache the CLIP context used to reject non-photographic NHTSA media."""

    global _PHOTO_CLIP_CONTEXT

    if _PHOTO_CLIP_CONTEXT is None:
        _PHOTO_CLIP_CONTEXT = get_photo_clip_context(photoTextLabels=PHOTO_TEXT_LABELS)

    return _PHOTO_CLIP_CONTEXT


def _build_damaged_vehicle_output_path(image_path: str) -> str:
    """Build the default output path used when no custom image stem is provided."""

    source_path = Path(image_path)
    return str(source_path.with_name(f"{source_path.stem}_damaged_vehicle.jpg"))


def _build_damaged_vehicle_output_path_with_custom_stem(image_path: str, output_stem: str | None = None) -> str:
    """Build the final output path for a validated damaged-vehicle image."""

    if not output_stem:
        return _build_damaged_vehicle_output_path(image_path)

    source_path = Path(image_path)
    return str(source_path.with_name(f"{output_stem}.jpg"))


def isValidImage(
    imagePath: str,
    output_stem: str | None = None,
    isFromNHTSA: bool = True,
) -> List[str]:
    """Validate an image and persist the damaged-vehicle output when it passes."""

    image = cv2.imread(imagePath)

    if image is None:
        delete_file_if_exists(imagePath)
        return []

    if isFromNHTSA:
        image, has_cars, _ = classify_cars_image(image, draw_outputs=False)

        if not has_cars:
            delete_file_if_exists(imagePath)
            return []

        clip_context = _get_nhtsa_photo_clip_context()
        isCarPhoto = is_photograph(
            imagePath,
            clip_context,
            [0],
            [i for i in range(1, len(PHOTO_TEXT_LABELS))],
        )

        if not isCarPhoto["isPhoto"]:
            delete_file_if_exists(imagePath)
            return []

    image, is_damaged, _ = classify_damages_image(image, applyMinimumBoxAreaThreshold=False, draw_outputs=False)

    if not is_damaged:
        delete_file_if_exists(imagePath)
        return []

    output_path = _build_damaged_vehicle_output_path_with_custom_stem(imagePath, output_stem=output_stem)
    cv2.imwrite(output_path, image)

    delete_file_if_exists(imagePath)
    return [output_path]