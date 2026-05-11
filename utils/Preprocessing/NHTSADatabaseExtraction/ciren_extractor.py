"""CIREN extraction workflow and cache helpers."""

import os
from typing import Any, Dict, List

from PATHS import CIREN_CACHE_OUTPUT_PATH
from PATHS import CIREN_IMAGES_OUTPUT_DIR
from configurations import CIREN_IGNORED_DESCRIPTION_KEYWORDS
from configurations import CIREN_REQUIRED_METADATA_KEYS
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import extract_case_general_vehicle
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import extract_case_summary
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import fetch_ciren_case_detail
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import fetch_ciren_case_index
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import iter_vehicle_image_candidates
from utils.Preprocessing.NHTSADatabaseExtraction.image_validation import isValidImage
from utils.Preprocessing.NHTSADatabaseExtraction.storage_utils import delete_file_if_exists
from utils.Preprocessing.NHTSADatabaseExtraction.storage_utils import read_cached_results
from utils.Preprocessing.NHTSADatabaseExtraction.storage_utils import remove_dir_if_empty
from utils.Preprocessing.NHTSADatabaseExtraction.storage_utils import sanitize_metadata_for_filename
from utils.Preprocessing.NHTSADatabaseExtraction.storage_utils import save_binary_file
from utils.Preprocessing.NHTSADatabaseExtraction.storage_utils import write_cached_results


def _build_ciren_case_payload(case_entry: Dict[str, Any], cached_case: Dict[str, Any], ciren_id: int) -> Dict[str, Any]:
    """Create the working cache payload for a CIREN case."""

    return {
        "cirenId": ciren_id,
        "make": case_entry.get("make"),
        "model": case_entry.get("model"),
        "modelYear": case_entry.get("modelYear"),
        "errors": list(cached_case.get("errors", [])) if isinstance(cached_case.get("errors"), list) else [],
        "validatedImages": list(cached_case.get("validatedImages", [])) if isinstance(cached_case.get("validatedImages"), list) else [],
        "candidateImages": list(cached_case.get("candidateImages", [])) if isinstance(cached_case.get("candidateImages"), list) else [],
    }


def _update_ciren_case_metadata(case_payload: Dict[str, Any], summary: Dict[str, Any], general_vehicle: Dict[str, Any]) -> None:
    """Merge stable summary and vehicle metadata into the CIREN case cache."""

    case_payload.update(
        {
            "caseId": summary.get("caseId"),
            "caseNumber": summary.get("cirenId") or case_payload["cirenId"],
            "mais": summary.get("mais"),
            "totalDeltaV": summary.get("totalDeltaV"),
            "objectContact": summary.get("objectContact"),
            "category": summary.get("category"),
            "vehicleMake": summary.get("make"),
            "vehicleModel": summary.get("model"),
            "vehicleModelYear": summary.get("modelYear"),
            "bodyCategory": general_vehicle.get("bodyCategory"),
            "bodyType": general_vehicle.get("ncsaBodyType") or general_vehicle.get("vpicBodyClass") or general_vehicle.get("finalStageBodyClass"),
            "vehicleClass": general_vehicle.get("vehicleClassDescription"),
            "vehicleHasTrailer": general_vehicle.get("hasTrailer"),
        }
    )


def _is_cached_ciren_case_complete(cached_case: Dict[str, Any]) -> bool:
    """Return whether a cached CIREN case already contains final images and metadata."""

    return bool(cached_case.get("validatedImages")) and all(
        metadata_key in cached_case for metadata_key in CIREN_REQUIRED_METADATA_KEYS
    )


def _build_ciren_output_stem(summary: Dict[str, Any], sequence: int, vehicle_number: Any = None) -> str:
    """Build a deterministic filename stem for validated CIREN outputs."""

    total_delta_v = summary.get("totalDeltaV") or summary.get("highestDeltaVTotal") or "UnknownDeltaV"
    severity = summary.get("mais") or summary.get("severityDescription") or "UnknownSeverity"
    vehicle_number = f"Vehicle{vehicle_number}" if vehicle_number is not None else "UnknownVehicle"

    return (
        f"{sanitize_metadata_for_filename(total_delta_v)}_"
        f"{sanitize_metadata_for_filename(severity)}_"
        f"{sequence:03d}_"
        f"{sanitize_metadata_for_filename(vehicle_number)}"
    )


def _build_ciren_case_output_dir(case_number: Any, output_dir: str) -> str:
    """Return the directory used to store validated images for a single CIREN case."""

    normalized_case_number = sanitize_metadata_for_filename(case_number, fallback="UnknownCase")
    return os.path.join(output_dir, normalized_case_number)


def download_valid_ciren_images(
    output_dir: str = CIREN_IMAGES_OUTPUT_DIR,
    cache_path: str = CIREN_CACHE_OUTPUT_PATH,
    ciren_ids: List[int] | None = None,
) -> Dict[str, Dict[str, Any]]:
    """Download, validate, and cache damaged-vehicle images from public CIREN cases."""

    cached_cases = read_cached_results(cache_path)

    ciren_cases = fetch_ciren_case_index()
    selected_ids = set(ciren_ids or [])
    if selected_ids:
        ciren_cases = [case for case in ciren_cases if case.get("cirenId") in selected_ids]

    print(f"Found {len(ciren_cases)} CIREN cases in Crash Viewer.")

    for case_entry in ciren_cases:
        ciren_id = case_entry.get("cirenId")
        if not isinstance(ciren_id, int):
            continue

        cache_key = str(ciren_id)
        cached_case = cached_cases.get(cache_key, {})
        if _is_cached_ciren_case_complete(cached_case):
            print(f"CIREN case {ciren_id} already processed. Skipping.")
            continue

        print(f"Processing CIREN case {ciren_id}...")

        case_output_dir = None

        case_payload = _build_ciren_case_payload(case_entry, cached_case, ciren_id)

        try:
            detail_payload = fetch_ciren_case_detail(ciren_id)
            summary = extract_case_summary(detail_payload)
            general_vehicle = extract_case_general_vehicle(detail_payload)

            _update_ciren_case_metadata(case_payload, summary, general_vehicle)

            if case_payload["validatedImages"]:
                cached_cases[cache_key] = case_payload
                write_cached_results(cache_path, cached_cases)
                continue

            case_output_dir = _build_ciren_case_output_dir(case_payload["caseNumber"], output_dir)
            os.makedirs(case_output_dir, exist_ok=True)

            validated_sequence = 1
            candidate_sequence = 1
            for image_candidate in iter_vehicle_image_candidates(ciren_id, detail_payload):
                if any(keyword in image_candidate.description.upper() for keyword in CIREN_IGNORED_DESCRIPTION_KEYWORDS):
                    continue

                output_stem = _build_ciren_output_stem(summary, validated_sequence, image_candidate.vehicle_number)
                candidate_stem = (
                    f"__candidate__{_build_ciren_output_stem(summary, candidate_sequence, image_candidate.vehicle_number)}"
                )
                candidate_file_path = os.path.join(case_output_dir, f"{candidate_stem}.jpg")
                save_binary_file(image_candidate.image_bytes, candidate_file_path)

                try:
                    validated_images = isValidImage(
                        candidate_file_path,
                        output_stem=output_stem,
                        isFromNHTSA=False,
                    )
                finally:
                    delete_file_if_exists(candidate_file_path)

                case_payload["candidateImages"].append(
                    {
                        "vehicleNumber": image_candidate.vehicle_number,
                        "description": image_candidate.description,
                        "objectID": image_candidate.object_id,
                        "photoId": image_candidate.photo_id,
                    }
                )

                if validated_images:
                    case_payload["validatedImages"].extend(validated_images)
                    validated_sequence += len(validated_images)

                candidate_sequence += 1

            if not case_payload["validatedImages"]:
                case_payload["errors"].append("No damaged vehicle photographs passed the current pipeline.")
                remove_dir_if_empty(case_output_dir)

        except Exception as exc:
            case_payload["errors"].append(str(exc))

        remove_dir_if_empty(case_output_dir)

        cached_cases[cache_key] = case_payload
        write_cached_results(cache_path, cached_cases)

    return cached_cases


def beginCirenExtraction(ciren_ids: List[int] | None = None):
    """Run the CIREN extraction flow and print the number of validated cases."""

    ciren_cases = download_valid_ciren_images(
        output_dir=CIREN_IMAGES_OUTPUT_DIR,
        cache_path=CIREN_CACHE_OUTPUT_PATH,
        ciren_ids=ciren_ids,
    )
    valid_case_count = sum(1 for case_payload in ciren_cases.values() if case_payload.get("validatedImages"))
    print(f"Total CIREN cases with validated damaged vehicle photos: {valid_case_count}")