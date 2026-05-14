"""Shared storage and filesystem helpers for NHTSA/CIREN extraction."""

import json
import os
import re
from typing import Any, Dict, List, Tuple
import pandas as pd


def delete_file_if_exists(file_path: str) -> None:
    """Delete a file if it exists, ignoring missing-path cases."""

    if os.path.exists(file_path):
        os.remove(file_path)


def sanitize_metadata_for_filename(value: Any, fallback: str = "Unknown") -> str:
    """Normalize metadata so it can be safely embedded in filenames."""

    if value is None:
        return fallback

    normalized = str(value).strip()
    if not normalized:
        return fallback

    normalized = normalized.replace("/", "-")
    normalized = normalized.replace("\\", "-")
    normalized = normalized.replace("`", "")
    normalized = re.sub(r"\s+", "-", normalized)
    normalized = re.sub(r"[^A-Za-z0-9._-]", "", normalized)
    normalized = re.sub(r"-+", "-", normalized).strip("-._")

    return normalized or fallback


def read_cached_results(cache_path: str | None) -> Dict[str, Dict[str, Any]]:
    """Read a JSON cache file if it exists, otherwise return an empty mapping."""

    if cache_path and os.path.isfile(cache_path):
        with open(cache_path, "r") as cache_file:
            payload = json.load(cache_file)
            if isinstance(payload, dict):
                return payload
    return {}


def write_cached_results(cache_path: str | None, payload: Dict[str, Dict[str, Any]]) -> None:
    """Persist cache payloads used by resumable NHTSA and CIREN extraction runs."""

    if not cache_path:
        return

    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    with open(cache_path, "w") as cache_file:
        json.dump(payload, cache_file, indent=4)


def remove_dir_if_empty(dir_path: str | None) -> None:
    """Remove a directory only when the current run left it empty."""

    if dir_path and os.path.isdir(dir_path) and not os.listdir(dir_path):
        os.rmdir(dir_path)


def save_binary_file(file_bytes: bytes, output_path: str) -> None:
    """Persist binary content to disk, creating parent directories when needed."""

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as output_file:
        output_file.write(file_bytes)


def _parse_delta_v(total_delta_v: Any) -> Tuple[int | None, int | None]:
    """Extract delta-v values in kmph and mph from the raw cache string."""

    if total_delta_v is None:
        return None, None

    total_delta_v_str = str(total_delta_v)
    kph_match = re.search(r"(\d+)(?=\s+kmph)", total_delta_v_str)
    mph_match = re.search(r"(\d+)(?=\s*mph)", total_delta_v_str)

    kph_velocity = int(kph_match.group(1)) if kph_match else None
    mph_velocity = int(mph_match.group(1)) if mph_match else None
    return kph_velocity, mph_velocity


def _extract_first_integer(value: Any) -> int | None:
    """Extract the first integer embedded in a string-like measurement."""

    if value is None:
        return None

    match = re.search(r"-?\d+", str(value))
    return int(match.group(0)) if match else None


def _normalize_relpath(path_value: str) -> str:
    """Normalize stored relative paths to a cross-platform forward-slash form."""

    return os.path.normpath(path_value).replace(os.sep, "/")


def _resolve_output_dir(output_path: str) -> str:
    """Accept either a directory or legacy parquet path and resolve the output directory."""

    normalized_output = os.path.normpath(output_path)
    if normalized_output.lower().endswith(".parquet"):
        normalized_output = os.path.splitext(normalized_output)[0]
    return normalized_output


def _coerce_nullable_integer(frame: pd.DataFrame, column_name: str) -> None:
    """Convert numeric-like columns to pandas nullable integers when present."""

    if column_name in frame.columns:
        frame[column_name] = pd.to_numeric(frame[column_name], errors="coerce").astype("Int64")


def _resolve_case_identifier(cache_key: str, case_data: Dict[str, Any]) -> int | str:
    """Use the payload identifier when present, otherwise fall back to the cache key."""

    ciren_id = case_data.get("cirenId", cache_key)
    if isinstance(ciren_id, str) and ciren_id.isdigit():
        return int(ciren_id)
    return ciren_id


def _extract_vehicle_number_from_filename(image_filename: str) -> int | None:
    """Parse the vehicle number encoded in the validated image filename."""

    vehicle_match = re.search(r"Vehicle(\d+)", image_filename)
    return int(vehicle_match.group(1)) if vehicle_match else None


def _extract_image_sequence_from_filename(image_filename: str) -> int | None:
    """Parse the sequence number encoded in the validated image filename."""

    sequence_match = re.search(r"_(\d+)_Vehicle\d+", image_filename)
    return int(sequence_match.group(1)) if sequence_match else None


def _build_image_id(ciren_id: Any, image_filename: str) -> str:
    """Build a deterministic image identifier stable across reruns."""

    image_stem, _ = os.path.splitext(image_filename)
    return f"ciren_{sanitize_metadata_for_filename(ciren_id)}_{image_stem}"


def _iter_validated_image_records(case_data: Dict[str, Any]):
    """Yield validated image records stored in the cache."""

    validated_image_records = case_data.get("validatedImageRecords")
    if isinstance(validated_image_records, list):
        for image_record in validated_image_records:
            if not isinstance(image_record, dict):
                continue
            image_path = image_record.get("imagePath")
            if not isinstance(image_path, str) or not image_path:
                continue
            yield image_record
        return

    validated_images = case_data.get("revisedImages")
    if isinstance(validated_images, list):
        for image_record in validated_images:
            if not isinstance(image_record, dict):
                continue
            image_path = image_record.get("imagePath")
            if not isinstance(image_path, str) or not image_path:
                continue
            yield image_record

def convert_cache_to_parquet(cache_path: str, output_path: str, originDB: str = "ciren") -> Dict[str, Any]:
    """Convert a cache JSON file into normalized parquet tables for analysis and training."""
    supported_dbs = {"ciren"}
    if originDB.lower() not in supported_dbs:
        raise ValueError(f"Unsupported originDB value: {originDB}. Supported values are {', '.join(supported_dbs)}.")

    cache_data = read_cached_results(cache_path)
    dataset_prefix = sanitize_metadata_for_filename(originDB.lower(), fallback="dataset")
    output_dir = _resolve_output_dir(output_path)

    case_records: List[Dict[str, Any]] = []
    image_records: List[Dict[str, Any]] = []
    error_records: List[Dict[str, Any]] = []

    for cache_key, case_data in cache_data.items():
        ciren_id = _resolve_case_identifier(cache_key, case_data)
        case_id = case_data.get("caseId")
        total_delta_v = case_data.get("totalDeltaV")
        kph_velocity, mph_velocity = _parse_delta_v(total_delta_v)

        case_records.append(
            {
                "cirenId": ciren_id,
                "caseId": case_id,
                "mais": case_data.get("mais"),
                "totalDeltaVKph": kph_velocity,
                "totalDeltaVMph": mph_velocity,
                "objectContact": case_data.get("objectContact"),
                "category": case_data.get("category"),
                "cdc": case_data.get("cdc"),
                "clockDirection": case_data.get("clockDirection"),
                "forceDirection": case_data.get("forceDirection"),
                "numberEvents": case_data.get("numberEvents"),
                "rolloverStatus": case_data.get("rolloverStatus"),
                "vehicleMake": case_data.get("vehicleMake"),
                "vehicleModel": case_data.get("vehicleModel"),
                "primaryVehicleNumber": case_data.get("primaryVehicleNumber"),
                "damagePlaneDescription": case_data.get("damagePlaneDescription"),
                "severityDescription": case_data.get("severityDescription"),
                "bodyCategory": case_data.get("bodyCategory"),
                "bodyType": case_data.get("bodyType"),
                "vehicleClass": case_data.get("vehicleClass"),
                "vehicleHasTrailer": case_data.get("vehicleHasTrailer"),
                "crashYear": case_data.get("crashYear"),
                "curbWeight": case_data.get("curbWeight"),
                "cargoWeight": case_data.get("cargoWeight"),
                "curbWeightKg": _extract_first_integer(case_data.get("curbWeight")),
                "cargoWeightKg": _extract_first_integer(case_data.get("cargoWeight")),
                "specialUseDescription": case_data.get("specialUseDescription"),
                "vehicleTransport": case_data.get("vehicleTransport"),
            }
        )

        for error_index, error_message in enumerate(case_data.get("errors", []), start=1):
            error_records.append(
                {
                    "cirenId": ciren_id,
                    "caseId": case_id,
                    "errorIndex": error_index,
                    "errorMessage": error_message,
                }
            )

        for image_record in _iter_validated_image_records(case_data):
            image_path = image_record["imagePath"]
            normalized_relpath = _normalize_relpath(image_path)
            absolute_image_path = os.path.abspath(image_path)
            image_filename = os.path.basename(normalized_relpath)
            vehicle_number = image_record.get("vehicleNumber")
            if vehicle_number is None:
                vehicle_number = _extract_vehicle_number_from_filename(image_filename)
            image_sequence = _extract_image_sequence_from_filename(image_filename)

            if not os.path.isfile(absolute_image_path):
                error_records.append(
                    {
                        "cirenId": ciren_id,
                        "caseId": case_id,
                        "errorIndex": None,
                        "errorMessage": f"Validated image missing on disk: {normalized_relpath}",
                    }
                )
                continue

            image_records.append(
                {
                    "image_id": _build_image_id(ciren_id, image_filename),
                    "cirenId": ciren_id,
                    "caseId": case_id,
                    "image_relpath": normalized_relpath,
                    "image_filename": image_filename,
                    "vehicleNumber": vehicle_number,
                    "image_sequence": image_sequence,
                    "photoId": image_record.get("photoId"),
                    "objectID": image_record.get("objectID"),
                    "description": image_record.get("description"),
                    "subtype": image_record.get("subtype"),
                }
            )

    cases_df = pd.DataFrame(
        case_records,
        columns=[
            "cirenId",
            "caseId",
            "mais",
            "totalDeltaVKph",
            "totalDeltaVMph",
            "objectContact",
            "category",
            "cdc",
            "clockDirection",
            "forceDirection",
            "numberEvents",
            "rolloverStatus",
            "vehicleMake",
            "vehicleModel",
            "primaryVehicleNumber",
            "damagePlaneDescription",
            "severityDescription",
            "bodyCategory",
            "bodyType",
            "vehicleClass",
            "vehicleHasTrailer",
            "crashYear",
            "curbWeight",
            "cargoWeight",
            "curbWeightKg",
            "cargoWeightKg",
            "specialUseDescription",
            "vehicleTransport",
        ],
    )
    images_df = pd.DataFrame(
        image_records,
        columns=[
            "image_id",
            "cirenId",
            "caseId",
            "image_relpath",
            "image_filename",
            "vehicleNumber",
            "image_sequence",
            "photoId",
            "objectID",
            "description",
            "subtype",
        ],
    )

    errors_df = pd.DataFrame(
        error_records,
        columns=["cirenId", "caseId", "errorIndex", "errorMessage"],
    )

    training_manifest_df = images_df.merge(
        cases_df[
            [
                "cirenId",
                "caseId",
                "mais",
                "totalDeltaVKph",
                "totalDeltaVMph",
                "objectContact",
                "category",
                "cdc",
                "clockDirection",
                "forceDirection",
                "numberEvents",
                "rolloverStatus",
                "vehicleMake",
                "vehicleModel",
                "primaryVehicleNumber",
                "damagePlaneDescription",
                "severityDescription",
                "bodyCategory",
                "bodyType",
                "vehicleClass",
                "vehicleHasTrailer",
                "crashYear",
                "curbWeight",
                "cargoWeight",
                "curbWeightKg",
                "cargoWeightKg",
                "specialUseDescription",
                "vehicleTransport",
            ]
        ],
        on=["cirenId", "caseId"],
        how="left",
    )

    for frame in (cases_df, images_df, errors_df, training_manifest_df):
        _coerce_nullable_integer(frame, "cirenId")
        _coerce_nullable_integer(frame, "caseId")
        _coerce_nullable_integer(frame, "vehicleNumber")
        _coerce_nullable_integer(frame, "image_sequence")
        _coerce_nullable_integer(frame, "photoId")
        _coerce_nullable_integer(frame, "errorIndex")
        _coerce_nullable_integer(frame, "totalDeltaVKph")
        _coerce_nullable_integer(frame, "totalDeltaVMph")
        _coerce_nullable_integer(frame, "numberEvents")
        _coerce_nullable_integer(frame, "primaryVehicleNumber")
        _coerce_nullable_integer(frame, "crashYear")
        _coerce_nullable_integer(frame, "curbWeightKg")
        _coerce_nullable_integer(frame, "cargoWeightKg")

    os.makedirs(output_dir, exist_ok=True)
    
    output_files = {
        "cases": os.path.join(output_dir, f"{dataset_prefix}_cases.parquet"),
        "images": os.path.join(output_dir, f"{dataset_prefix}_images.parquet"),
        "training_manifest": os.path.join(output_dir, f"{dataset_prefix}_training_manifest.parquet"),
    }

    cases_df.to_parquet(output_files["cases"], index=False)
    images_df.to_parquet(output_files["images"], index=False)
    training_manifest_df.to_parquet(output_files["training_manifest"], index=False)

    return {
        "outputDir": output_dir,
        "files": output_files,
        "rowCounts": {
            "cases": len(cases_df),
            "images": len(images_df),
            "training_manifest": len(training_manifest_df),
        },
    }
