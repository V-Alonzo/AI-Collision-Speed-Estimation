import base64
import binascii
import json
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List


BASE_URL = "https://crashviewer.nhtsa.dot.gov"
_DEFAULT_TIMEOUT_SECONDS = 60
_CIREN_MODE = 3



@dataclass(frozen=True)
class CirenImageCandidate:
    ciren_id: int
    vehicle_number: int
    description: str
    object_id: str
    photo_id: int | None
    image_bytes: bytes
    subtype :str


def _build_session():
    try:
        from curl_cffi import requests as curl_requests
    except ImportError as exc:
        raise ImportError(
            "curl_cffi is required for CIREN extraction. Install the project environment again or add the dependency."
        ) from exc

    session = curl_requests.Session(impersonate="chrome")
    session.headers.update(
        {
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
            "Origin": BASE_URL,
            "Referer": f"{BASE_URL}/ciren/searchindex",
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
        }
    )
    return session


def _decode_data_url_image(data_url: str) -> bytes:
    if not data_url or "," not in data_url:
        raise ValueError("Invalid CIREN thumbnail payload.")

    encoded_image = data_url.split(",", 1)[1]
    try:
        return base64.b64decode(encoded_image)
    except (ValueError, binascii.Error) as exc:
        raise ValueError("Failed to decode CIREN thumbnail payload.") from exc


def _fetch_full_resolution_photo(session, photo_id: int) -> bytes:
    response = session.get(
        f"{BASE_URL}/api/ciren/photo/download/{photo_id}",
        timeout=_DEFAULT_TIMEOUT_SECONDS,
    )
    response.raise_for_status()

    if not response.content:
        raise ValueError(f"Empty full-resolution CIREN payload for photo {photo_id}.")

    return response.content


def _fetch_ciren_case_overview_tree(session, ciren_id: int) -> List[Dict[str, Any]]:
    response = session.get(
        f"{BASE_URL}/api/Ciren/CaseOverviewTreeResult",
        params={"cirenID": ciren_id, "mode": _CIREN_MODE},
        timeout=_DEFAULT_TIMEOUT_SECONDS,
    )
    response.raise_for_status()

    payload = response.json()
    if not isinstance(payload, list):
        raise ValueError(f"Unexpected CIREN case overview tree format for case {ciren_id}.")

    return payload


def _parse_case_tree_node_params(raw_params: Any) -> Dict[str, Any]:
    if not isinstance(raw_params, str) or not raw_params:
        return {}
    try:
        payload = json.loads(raw_params)
    except json.JSONDecodeError:
        return {}

    return payload if isinstance(payload, dict) else {}


def _extract_vehicle_image_subtypes(case_overview_tree: List[Dict[str, Any]]) -> Dict[int, List[str]]:
    subtypes_by_vehicle: Dict[int, List[str]] = {}

    for node in case_overview_tree:
        if not isinstance(node, dict):
            continue
        if node.get("componentName") != "VehicleImagesComponent":
            continue

        params = _parse_case_tree_node_params(node.get("params"))
        vehicle_number = params.get("pVehNo")
        subtype = params.get("pSubType")

        if not isinstance(vehicle_number, int):
            continue
        if not isinstance(subtype, str) or not subtype:
            continue

        subtypes = subtypes_by_vehicle.setdefault(vehicle_number, [])
        if subtype not in subtypes:
            subtypes.append(subtype)

    return subtypes_by_vehicle


def _unique_vehicle_numbers(detail_payload: Dict[str, Any]) -> List[int]:
    vehicle_numbers = set()

    for vehicle in detail_payload.get("cirenGeneralVehicleVehicles", []):
        vehicle_number = vehicle.get("vehicleNumber")
        if isinstance(vehicle_number, int):
            vehicle_numbers.add(vehicle_number)

    for vehicle in detail_payload.get("cirenCrashSummaryVehicles", []):
        vehicle_number = vehicle.get("vehicleNumber")
        if isinstance(vehicle_number, int):
            vehicle_numbers.add(vehicle_number)

    return sorted(vehicle_numbers)


def fetch_ciren_case_index() -> List[Dict[str, Any]]:
    session = _build_session()
    response = session.post(
        f"{BASE_URL}/api/ciren/cases/search",
        json={"filters": []},
        timeout=_DEFAULT_TIMEOUT_SECONDS,
    )
    response.raise_for_status()

    payload = response.json()
    if not isinstance(payload, list):
        raise ValueError("Unexpected CIREN case index response format.")

    return payload


def fetch_ciren_case_detail(ciren_id: int) -> Dict[str, Any]:
    session = _build_session()
    response = session.get(
        f"{BASE_URL}/api/Ciren/GetCirenCrashDetails",
        params={"cirenId": ciren_id},
        timeout=_DEFAULT_TIMEOUT_SECONDS,
    )
    response.raise_for_status()

    payload = response.json()
    if not isinstance(payload, dict):
        raise ValueError(f"Unexpected CIREN detail response format for case {ciren_id}.")

    return payload


def _normalize_vehicle_identity_value(value: Any) -> str:
    if value is None:
        return ""

    return " ".join(str(value).strip().lower().split())


def _find_primary_general_vehicle(
    detail_payload: Dict[str, Any], summary: Dict[str, Any] | None = None
) -> Dict[str, Any]:
    general_vehicles = detail_payload.get("cirenGeneralVehicleVehicles", [])
    if not isinstance(general_vehicles, list) or not general_vehicles:
        return {}

    summary = summary if isinstance(summary, dict) else extract_case_summary(detail_payload)
    crash_summary_vehicles = detail_payload.get("cirenCrashSummaryVehicles", [])

    summary_make = _normalize_vehicle_identity_value(summary.get("make"))
    summary_model = _normalize_vehicle_identity_value(summary.get("model"))
    summary_model_year = _normalize_vehicle_identity_value(summary.get("modelYear"))

    candidate_vehicle_numbers = []
    if isinstance(crash_summary_vehicles, list):
        for vehicle in crash_summary_vehicles:
            if not isinstance(vehicle, dict):
                continue

            vehicle_number = vehicle.get("vehicleNumber")
            if not isinstance(vehicle_number, int):
                continue

            make_matches = _normalize_vehicle_identity_value(vehicle.get("makeDescription")) == summary_make
            model_matches = _normalize_vehicle_identity_value(vehicle.get("modelDescription")) == summary_model
            year_matches = _normalize_vehicle_identity_value(vehicle.get("modelYearDescription")) == summary_model_year

            if make_matches and model_matches and year_matches:
                candidate_vehicle_numbers.append(vehicle_number)

    if len(candidate_vehicle_numbers) == 1:
        selected_vehicle_number = candidate_vehicle_numbers[0]
        for vehicle in general_vehicles:
            if vehicle.get("vehicleNumber") == selected_vehicle_number:
                return vehicle

    if len(general_vehicles) == 1 and isinstance(general_vehicles[0], dict):
        return general_vehicles[0]

    if isinstance(crash_summary_vehicles, list) and len(crash_summary_vehicles) == 1:
        selected_vehicle_number = crash_summary_vehicles[0].get("vehicleNumber")
        for vehicle in general_vehicles:
            if vehicle.get("vehicleNumber") == selected_vehicle_number:
                return vehicle

    for vehicle in general_vehicles:
        if isinstance(vehicle, dict):
            return vehicle

    return {}


def extract_case_summary(detail_payload: Dict[str, Any]) -> Dict[str, Any]:
    summary = detail_payload.get("cirenSummary")
    if not isinstance(summary, dict):
        return {}

    return summary


def extract_case_general_vehicle(detail_payload: Dict[str, Any]) -> Dict[str, Any]:
    summary = extract_case_summary(detail_payload)
    general_vehicle = _find_primary_general_vehicle(detail_payload, summary=summary)
    if not isinstance(general_vehicle, dict):
        return {}

    return general_vehicle


def iter_vehicle_image_candidates(ciren_id: int, detail_payload: Dict[str, Any]) -> Iterable[CirenImageCandidate]:
    session = _build_session()
    seen_object_ids = set()
    case_overview_tree = _fetch_ciren_case_overview_tree(session, ciren_id)
    subtypes_by_vehicle = _extract_vehicle_image_subtypes(case_overview_tree)

    toIgnoreSubtypesKeywords = ["INTERIOR", "EXEMPLAR", "INT", "MISCELLANEOUS", "UNDERCARRIAGE", "TOP"]

    for vehicle_number in _unique_vehicle_numbers(detail_payload):
        for subtype in subtypes_by_vehicle.get(vehicle_number, []):

            if any(keyword in subtype.upper() for keyword in toIgnoreSubtypesKeywords):
                print(f"Ignoring subtype {subtype} for vehicle {vehicle_number} in case {ciren_id} due to matching ignore keywords.")
                continue

            response = session.get(
                f"{BASE_URL}/api/ciren/GetVehThumbnailsByVehNo",
                params={"caseID": ciren_id, "vehNo": vehicle_number, "subType": subtype},
                timeout=_DEFAULT_TIMEOUT_SECONDS,
            )
            response.raise_for_status()

            payload = response.json()
            if not isinstance(payload, list):
                continue

            for image_entry in payload:
                if not isinstance(image_entry, dict):
                    continue

                object_id = image_entry.get("objectID")
                thumbnail = image_entry.get("thumbnail")
                photo_id = image_entry.get("photoid") if isinstance(image_entry.get("photoid"), int) else None
                description = str(image_entry.get("description", ""))
                if not isinstance(object_id, str) or not object_id:
                    continue
                if not isinstance(thumbnail, str) or not thumbnail:
                    continue
                if object_id in seen_object_ids:
                    continue

                seen_object_ids.add(object_id)

                image_bytes = _decode_data_url_image(thumbnail)
                if photo_id is not None:
                    try:
                        image_bytes = _fetch_full_resolution_photo(session, photo_id)
                    except Exception:
                        # Crash Viewer occasionally exposes a thumbnail entry that cannot be fetched at full resolution.
                        # Keep the candidate instead of dropping the case entirely.
                        image_bytes = _decode_data_url_image(thumbnail)

                yield CirenImageCandidate(
                    ciren_id=ciren_id,
                    vehicle_number=vehicle_number,
                    description=description,
                    object_id=object_id,
                    photo_id=photo_id,
                    image_bytes=image_bytes,
                    subtype=subtype,
                )