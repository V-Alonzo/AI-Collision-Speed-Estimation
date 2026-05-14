"""CIREN extraction workflow and cache helpers."""

import ast
import os
from typing import Any, Dict, List

from PATHS import CIREN_CACHE_OUTPUT_PATH
from PATHS import CIREN_IMAGES_OUTPUT_DIR
from configurations import CIREN_IGNORED_DESCRIPTION_KEYWORDS
from configurations import CIREN_REQUIRED_METADATA_KEYS
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import CirenImageCandidate
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import extract_case_crash_summary_vehicle
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import extract_case_general_vehicle
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import extract_case_summary
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import fetch_ciren_candidate_image_bytes
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


_CIREN_CONFIGURABLE_METADATA_KEYS = (
    "objectContact",
    "category",
    "cdc",
    "clockDirection",
    "forceDirection",
    "numberEvents",
    "rolloverStatus",
    "vehicleMake",
    "vehicleModel",
    "vehicleModelYear",
    "vehicleNumber",
    "damagePlaneDescription",
    "severityDescription",
    "bodyCategory",
    "bodyType",
    "vehicleHasTrailer",
    "crashYear",
    "curbWeight",
    "cargoWeight",
    "specialUseDescription",
    "vehicleTransport",
    "mais",
    "totalDeltaV",
    "vehicleClass",
    "primaryVehicleNumber",
    "crashSummaryText",
    "make",
    "model",
    "modelYear"
)

_CIREN_STABLE_CACHE_KEYS = (
    "caseId",
    "caseNumber",
    "mais",
    "totalDeltaV",
)


def _get_configured_ciren_metadata_keys() -> tuple[str, ...]:
    """Return the configured CIREN metadata keys after validating they are supported."""

    unsupported_keys = [
        metadata_key
        for metadata_key in CIREN_REQUIRED_METADATA_KEYS
        if metadata_key not in _CIREN_CONFIGURABLE_METADATA_KEYS
    ]
    if unsupported_keys:
        raise ValueError(
            "Unsupported CIREN metadata keys in configurations.CIREN_REQUIRED_METADATA_KEYS: "
            + ", ".join(sorted(unsupported_keys))
        )

    return tuple(CIREN_REQUIRED_METADATA_KEYS)


def _prune_unconfigured_ciren_metadata(case_payload: Dict[str, Any]) -> None:
    """Remove configurable CIREN metadata keys that are no longer selected in configuration."""

    configured_metadata_keys = set(_get_configured_ciren_metadata_keys())
    for metadata_key in _CIREN_CONFIGURABLE_METADATA_KEYS:
        if metadata_key in _CIREN_STABLE_CACHE_KEYS:
            continue
        if metadata_key not in configured_metadata_keys:
            case_payload.pop(metadata_key, None)


def _has_required_ciren_cache_metadata(case_payload: Dict[str, Any]) -> bool:
    """Return whether a cache entry already includes all required persisted metadata."""

    return all(metadata_key in case_payload for metadata_key in _get_configured_ciren_metadata_keys()) and all(
        cache_key in case_payload for cache_key in _CIREN_STABLE_CACHE_KEYS
    )


def _extract_ciren_metadata_error_keys(
    error_message: str, configured_metadata_keys: set[str]
) -> set[str] | None:
    """Return configured metadata keys referenced by a legacy metadata error message."""

    parsed_error: Any = error_message
    try:
        parsed_error = ast.literal_eval(error_message)
    except (SyntaxError, ValueError):
        parsed_error = error_message

    if isinstance(parsed_error, str):
        return {parsed_error} if parsed_error in configured_metadata_keys else None

    if not isinstance(parsed_error, (list, tuple, set)) or not parsed_error:
        return None

    if not all(isinstance(metadata_key, str) for metadata_key in parsed_error):
        return None

    parsed_metadata_keys = set(parsed_error)
    if not parsed_metadata_keys.issubset(configured_metadata_keys):
        return None

    return parsed_metadata_keys


def _sync_ciren_metadata_errors(case_payload: Dict[str, Any]) -> None:
    """Keep cached metadata errors aligned with the currently configured CIREN keys."""

    configured_metadata_keys = _get_configured_ciren_metadata_keys()
    configured_metadata_key_set = set(configured_metadata_keys)

    normalized_errors: List[str] = []
    seen_errors = set()
    for error_message in case_payload.get("errors", []):
        if not isinstance(error_message, str) or not error_message:
            continue

        if _extract_ciren_metadata_error_keys(error_message, configured_metadata_key_set) is not None:
            continue

        if error_message in seen_errors:
            continue

        seen_errors.add(error_message)
        normalized_errors.append(error_message)

    for metadata_key in configured_metadata_keys:
        if metadata_key in case_payload:
            continue
        if metadata_key in seen_errors:
            continue
        normalized_errors.append(metadata_key)

    case_payload["errors"] = normalized_errors


def _build_ciren_case_payload(case_entry: Dict[str, Any], cached_case: Dict[str, Any], ciren_id: int) -> Dict[str, Any]:
    """Create the working cache payload for a CIREN case."""

    case_payload = dict(cached_case) if isinstance(cached_case, dict) else {}
    case_payload.update(
        {
            "cirenId": ciren_id,
            "errors": list(cached_case.get("errors", [])) if isinstance(cached_case.get("errors"), list) else [],
            "candidateImages": (
                list(cached_case.get("candidateImages", [])) if isinstance(cached_case.get("candidateImages"), list) else []
            ),
            "revisedImages": _normalize_validated_ciren_object_ids(cached_case.get("revisedImages")),
            "validatedImageRecords": _normalize_validated_image_records(cached_case.get("validatedImageRecords")),
        }
    )
    case_payload["validImages"] = _normalize_valid_ciren_object_ids(case_payload, cached_case)
    case_payload.pop("candidateImagesCataloged", None)
    _prune_unconfigured_ciren_metadata(case_payload)
    _sync_ciren_metadata_errors(case_payload)
    return case_payload


def _normalize_validated_ciren_object_ids(validated_images: Any) -> List[str]:
    """Normalize cached validated-images payloads to a unique list of object ids."""

    normalized_object_ids: List[str] = []
    seen_object_ids = set()

    if not isinstance(validated_images, list):
        return normalized_object_ids

    for validated_image in validated_images:
        object_id = None
        if isinstance(validated_image, str):
            object_id = validated_image
        elif isinstance(validated_image, dict):
            object_id = validated_image.get("objectID")

        if not isinstance(object_id, str) or not object_id or object_id in seen_object_ids:
            continue

        seen_object_ids.add(object_id)
        normalized_object_ids.append(object_id)

    return normalized_object_ids


def _normalize_valid_ciren_object_ids(case_payload: Dict[str, Any], cached_case: Dict[str, Any]) -> List[str]:
    """Normalize cached valid-images payloads to a unique list of object ids."""

    valid_object_ids = _normalize_validated_ciren_object_ids(cached_case.get("validImages"))
    if valid_object_ids:
        return valid_object_ids

    derived_object_ids: List[str] = []
    seen_object_ids = set()
    for validated_image_record in case_payload.get("validatedImageRecords", []):
        object_id = validated_image_record.get("objectID")
        if not isinstance(object_id, str) or not object_id or object_id in seen_object_ids:
            continue
        seen_object_ids.add(object_id)
        derived_object_ids.append(object_id)

    return derived_object_ids


def _normalize_validated_image_records(validated_image_records: Any) -> List[Dict[str, Any]]:
    """Keep only validated-image records that still expose a persisted image path."""

    normalized_records: List[Dict[str, Any]] = []

    if not isinstance(validated_image_records, list):
        return normalized_records

    for validated_image_record in validated_image_records:
        if not isinstance(validated_image_record, dict):
            continue
        image_path = validated_image_record.get("imagePath")
        if not isinstance(image_path, str) or not image_path:
            continue
        normalized_records.append(dict(validated_image_record))

    return normalized_records


def _has_cataloged_ciren_candidates(cached_case: Dict[str, Any]) -> bool:
    """Return whether candidate images were already cataloged for a cached case."""

    if not isinstance(cached_case, dict):
        return False

    if isinstance(cached_case.get("candidateImages"), list):
        return True

    return bool(cached_case.get("candidateImagesCataloged"))


def _get_pending_ciren_candidate_payloads(case_payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Return the candidate images whose object ids have not been processed yet."""

    processed_object_ids = set(case_payload.get("revisedImages", []))
    pending_candidates: List[Dict[str, Any]] = []

    for candidate_payload in case_payload.get("candidateImages", []):
        if not isinstance(candidate_payload, dict):
            continue

        object_id = candidate_payload.get("objectID")
        if not isinstance(object_id, str) or not object_id:
            continue
        if object_id in processed_object_ids:
            continue

        pending_candidates.append(candidate_payload)

    return pending_candidates


def _append_validated_ciren_object_id(case_payload: Dict[str, Any], object_id: str) -> None:
    """Persist one processed candidate object id only once per case."""

    if object_id not in case_payload["revisedImages"]:
        case_payload["revisedImages"].append(object_id)


def _append_valid_ciren_object_id(case_payload: Dict[str, Any], object_id: str) -> None:
    """Persist one successfully validated candidate object id only once per case."""

    if object_id not in case_payload["validImages"]:
        case_payload["validImages"].append(object_id)


def _append_validated_ciren_image_record(
    case_payload: Dict[str, Any], image_candidate: CirenImageCandidate, image_path: str
) -> None:
    """Persist metadata for one validated CIREN output image."""

    case_payload["validatedImageRecords"].append(
        {
            "imagePath": image_path,
            "vehicleNumber": image_candidate.vehicle_number,
            "photoId": image_candidate.photo_id,
            "objectID": image_candidate.object_id,
            "description": image_candidate.description,
            "subtype": image_candidate.subtype,
        }
    )


def _update_ciren_case_metadata(
    case_payload: Dict[str, Any],
    summary: Dict[str, Any],
    general_vehicle: Dict[str, Any],
    crash_summary_vehicle: Dict[str, Any],
) -> None:
    """Merge stable summary and configured vehicle metadata into the CIREN case cache."""

    configured_metadata_keys = _get_configured_ciren_metadata_keys()

    available_metadata = {
        "objectContact": summary.get("objectContact"),
        "category": summary.get("category"),
        "cdc": summary.get("cdc"),
        "clockDirection": summary.get("clockDirection"),
        "forceDirection": summary.get("forceDirection"),
        "numberEvents": summary.get("numberEvents"),
        "rolloverStatus": summary.get("rolloverStatus"),
        "vehicleMake": summary.get("make"),
        "vehicleModel": summary.get("model"),
        "vehicleModelYear": summary.get("modelYear"),
        "vehicleNumber": general_vehicle.get("vehicleNumber") or crash_summary_vehicle.get("vehicleNumber"),
        "primaryVehicleNumber": general_vehicle.get("vehicleNumber") or crash_summary_vehicle.get("vehicleNumber"),
        "damagePlaneDescription": crash_summary_vehicle.get("damagePlaneDescription"),
        "severityDescription": crash_summary_vehicle.get("severityDescription"),
        "bodyCategory": general_vehicle.get("bodyCategory"),
        "bodyType": general_vehicle.get("ncsaBodyType")
        or general_vehicle.get("vpicBodyClass")
        or general_vehicle.get("finalStageBodyClass"),
        "vehicleClass": general_vehicle.get("vehicleClassDescription"),
        "vehicleHasTrailer": general_vehicle.get("hasTrailer"),
        "crashYear": general_vehicle.get("crashYear"),
        "curbWeight": general_vehicle.get("curbWeight"),
        "cargoWeight": general_vehicle.get("cargoWeight"),
        "specialUseDescription": general_vehicle.get("specialUseDescription"),
        "vehicleTransport": general_vehicle.get("vehicleTransport"),
        "mais": summary.get("mais"),
        "totalDeltaV": summary.get("totalDeltaV"),
        "crashSummaryText": summary.get("crashSummaryText") or summary.get("crashSummary"),
        "make": summary.get("make"),
        "model": summary.get("model"),
        "modelYear": summary.get("modelYear"),
    }

    missing_supported_mappings = [
        metadata_key
        for metadata_key in _CIREN_CONFIGURABLE_METADATA_KEYS
        if metadata_key not in available_metadata
    ]
    if missing_supported_mappings:
        raise KeyError(
            "Missing CIREN metadata mappings for supported keys: " + ", ".join(sorted(missing_supported_mappings))
        )

    for metadata_key in _CIREN_CONFIGURABLE_METADATA_KEYS:
        case_payload.pop(metadata_key, None)

    case_payload.update(
        {
            "caseId": summary.get("caseId"),
            "caseNumber": summary.get("cirenId") or case_payload["cirenId"],
            "mais": summary.get("mais"),
            "totalDeltaV": summary.get("totalDeltaV"),
        }
    )

    case_payload.update(
        {
            metadata_key: available_metadata[metadata_key]
            for metadata_key in configured_metadata_keys
        }
    )
    _sync_ciren_metadata_errors(case_payload)


def _resolve_cached_ciren_id(cache_key: str, case_payload: Dict[str, Any]) -> int | None:
    """Resolve the CIREN identifier from either cache metadata or the cache key."""

    ciren_id = case_payload.get("cirenId")
    if isinstance(ciren_id, int):
        return ciren_id

    if isinstance(cache_key, str) and cache_key.isdigit():
        return int(cache_key)

    return None


def refresh_ciren_case_metadata(
    cache_path: str = CIREN_CACHE_OUTPUT_PATH,
    ciren_ids: List[int] | None = None,
) -> Dict[str, Dict[str, Any]]:
    """Refresh cached CIREN case metadata without rerunning image extraction."""

    extract_ciren_case_candidates(CIREN_CACHE_OUTPUT_PATH)

    cached_cases = read_cached_results(cache_path)
    if not cached_cases:
        return cached_cases

    selected_ids = set(ciren_ids or [])

    for cache_key, cached_case in cached_cases.items():
        if not isinstance(cached_case, dict):
            continue

        _prune_unconfigured_ciren_metadata(cached_case)
        _sync_ciren_metadata_errors(cached_case)

        ciren_id = _resolve_cached_ciren_id(cache_key, cached_case)
        if ciren_id is None:
            continue
        if selected_ids and ciren_id not in selected_ids:
            continue
        if _has_required_ciren_cache_metadata(cached_case):
            cached_cases[cache_key] = cached_case
            write_cached_results(cache_path, cached_cases)
            continue

        detail_payload = fetch_ciren_case_detail(ciren_id)
        summary = extract_case_summary(detail_payload)
        general_vehicle = extract_case_general_vehicle(detail_payload)
        crash_summary_vehicle = extract_case_crash_summary_vehicle(detail_payload)
        _update_ciren_case_metadata(cached_case, summary, general_vehicle, crash_summary_vehicle)
        cached_cases[cache_key] = cached_case
        write_cached_results(cache_path, cached_cases)

    return cached_cases


def _is_cached_ciren_case_complete(cached_case: Dict[str, Any]) -> bool:
    """Return whether a cached CIREN case already contains final images and metadata."""

    return _has_required_ciren_cache_metadata(cached_case) and not _get_pending_ciren_candidate_payloads(cached_case)


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



def _build_ciren_candidate_record(image_candidate: CirenImageCandidate) -> Dict[str, Any]:
    """Serialize a cataloged CIREN candidate for cache storage."""

    return {
        "vehicleNumber": image_candidate.vehicle_number,
        "description": image_candidate.description,
        "objectID": image_candidate.object_id,
        "photoId": image_candidate.photo_id,
        "subtype": image_candidate.subtype,
    }


def _build_ciren_candidate_from_cache(ciren_id: int, candidate_payload: Dict[str, Any]) -> CirenImageCandidate | None:
    """Hydrate a cached CIREN candidate record back into the client model."""

    vehicle_number = candidate_payload.get("vehicleNumber")
    description = candidate_payload.get("description")
    object_id = candidate_payload.get("objectID")
    subtype = candidate_payload.get("subtype")
    photo_id = candidate_payload.get("photoId")

    if not isinstance(vehicle_number, int):
        return None
    if not isinstance(description, str):
        return None
    if not isinstance(object_id, str) or not object_id:
        return None
    if not isinstance(subtype, str) or not subtype:
        return None

    return CirenImageCandidate(
        ciren_id=ciren_id,
        vehicle_number=vehicle_number,
        description=description,
        object_id=object_id,
        photo_id=photo_id if isinstance(photo_id, int) else None,
        subtype=subtype,
    )


def _is_cached_ciren_case_cataloged(cached_case: Dict[str, Any]) -> bool:
    """Return whether a cached CIREN case already contains metadata and candidate image records."""

    return _has_cataloged_ciren_candidates(cached_case) and _has_required_ciren_cache_metadata(cached_case)


def extract_ciren_case_candidates(
    cache_path: str = CIREN_CACHE_OUTPUT_PATH,
    ciren_ids: List[int] | None = None,
) -> Dict[str, Dict[str, Any]]:
    """Extract CIREN case metadata and candidate image records without downloading image bytes."""

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
        case_payload = _build_ciren_case_payload(case_entry, cached_case, ciren_id)

        if _is_cached_ciren_case_cataloged(cached_case):
            if case_payload != cached_case:
                cached_cases[cache_key] = case_payload
                write_cached_results(cache_path, cached_cases)
            print(f"CIREN case {ciren_id} already cataloged. Skipping.")
            continue

        print(f"Cataloging CIREN case {ciren_id}...")

        try:
            detail_payload = fetch_ciren_case_detail(ciren_id)
            summary = extract_case_summary(detail_payload)
            general_vehicle = extract_case_general_vehicle(detail_payload)
            crash_summary_vehicle = extract_case_crash_summary_vehicle(detail_payload)

            _update_ciren_case_metadata(case_payload, summary, general_vehicle, crash_summary_vehicle)
            case_payload["candidateImages"] = [
                _build_ciren_candidate_record(image_candidate)
                for image_candidate in iter_vehicle_image_candidates(ciren_id, detail_payload)
            ]

        except Exception as exc:
            case_payload["errors"].append(str(exc))

        cached_cases[cache_key] = case_payload
        write_cached_results(cache_path, cached_cases)

    return cached_cases


def download_valid_ciren_images(
    output_dir: str = CIREN_IMAGES_OUTPUT_DIR,
    cache_path: str = CIREN_CACHE_OUTPUT_PATH,
    ciren_ids: List[int] | None = None,
) -> Dict[str, Dict[str, Any]]:
    """Download and validate cached CIREN candidate images."""

    cached_cases = read_cached_results(cache_path)
    selected_ids = set(ciren_ids or [])

    cached_case_items = []
    for cache_key, cached_case in cached_cases.items():
        if not isinstance(cached_case, dict):
            continue

        ciren_id = _resolve_cached_ciren_id(cache_key, cached_case)
        if ciren_id is None:
            continue
        if selected_ids and ciren_id not in selected_ids:
            continue
        if not _has_cataloged_ciren_candidates(cached_case):
            continue

        cached_case_items.append((cache_key, ciren_id, cached_case))

    print(f"Validating candidate images for {len(cached_case_items)} cached CIREN cases.")

    for cache_key, ciren_id, cached_case in cached_case_items:
        case_payload = _build_ciren_case_payload(cached_case, cached_case, ciren_id)

        if _is_cached_ciren_case_complete(case_payload):
            if case_payload != cached_case:
                cached_cases[cache_key] = case_payload
                write_cached_results(cache_path, cached_cases)
            print(f"CIREN case {ciren_id} already processed. Skipping.")
            continue

        pending_candidate_payloads = _get_pending_ciren_candidate_payloads(case_payload)
        if not pending_candidate_payloads:
            if case_payload != cached_case:
                cached_cases[cache_key] = case_payload
                write_cached_results(cache_path, cached_cases)
            print(f"CIREN case {ciren_id} has no pending candidate images. Skipping.")
            continue

        print(f"Processing CIREN case {ciren_id}...")

        case_output_dir = None

        try:
            case_output_dir = _build_ciren_case_output_dir(case_payload["caseNumber"], output_dir)
            os.makedirs(case_output_dir, exist_ok=True)

            validated_sequence = len(case_payload["validatedImageRecords"]) + 1
            for candidate_sequence, candidate_payload in enumerate(pending_candidate_payloads, start=1):
                object_id = candidate_payload.get("objectID")
                if not isinstance(object_id, str) or not object_id:
                    continue

                image_candidate = _build_ciren_candidate_from_cache(ciren_id, candidate_payload)
                if image_candidate is None:
                    case_payload["errors"].append(
                        f"Malformed CIREN candidate payload for case {ciren_id}: missing fields for objectID {object_id}."
                    )
                    _append_validated_ciren_object_id(case_payload, object_id)
                    continue

                if any(keyword in image_candidate.description.upper() for keyword in CIREN_IGNORED_DESCRIPTION_KEYWORDS):
                    _append_validated_ciren_object_id(case_payload, object_id)
                    continue

                output_stem = _build_ciren_output_stem(case_payload, validated_sequence, image_candidate.vehicle_number)
                candidate_stem = (
                    f"__candidate__{_build_ciren_output_stem(case_payload, candidate_sequence, image_candidate.vehicle_number)}"
                )
                candidate_file_path = os.path.join(case_output_dir, f"{candidate_stem}.jpg")
                image_bytes = fetch_ciren_candidate_image_bytes(image_candidate)
                save_binary_file(image_bytes, candidate_file_path)
                validated_images = []

                try:
                    validated_images = isValidImage(
                        candidate_file_path,
                        output_stem=output_stem,
                        isFromNHTSA=False,
                    )
                finally:
                    delete_file_if_exists(candidate_file_path)

                _append_validated_ciren_object_id(case_payload, object_id)

                for validated_image_path in validated_images:
                    _append_valid_ciren_object_id(case_payload, object_id)
                    _append_validated_ciren_image_record(case_payload, image_candidate, validated_image_path)
                    validated_sequence += 1

            if not case_payload["validatedImageRecords"]:
                no_validated_images_error = "No damaged vehicle photographs passed the current pipeline."
                if no_validated_images_error not in case_payload["errors"]:
                    case_payload["errors"].append(no_validated_images_error)
                remove_dir_if_empty(case_output_dir)

        except Exception as exc:
            case_payload["errors"].append(str(exc))

        remove_dir_if_empty(case_output_dir)

        cached_cases[cache_key] = case_payload
        write_cached_results(cache_path, cached_cases)

    return cached_cases


def beginCirenExtraction(ciren_ids: List[int] | None = None):
    """Run the CIREN extraction flow and print the number of validated cases."""

    extract_ciren_case_candidates(
        cache_path=CIREN_CACHE_OUTPUT_PATH,
        ciren_ids=ciren_ids,
    )

    ciren_cases = download_valid_ciren_images(
        output_dir=CIREN_IMAGES_OUTPUT_DIR,
        cache_path=CIREN_CACHE_OUTPUT_PATH,
        ciren_ids=ciren_ids,
    )