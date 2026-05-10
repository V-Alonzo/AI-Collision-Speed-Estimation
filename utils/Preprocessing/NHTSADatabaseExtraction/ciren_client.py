import base64
import binascii
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List


BASE_URL = "https://crashviewer.nhtsa.dot.gov"
_DEFAULT_TIMEOUT_SECONDS = 60

# The CIREN vehicle image gallery exposes subtype buckets like these in Crash Viewer.
# Restricting to the exterior-oriented buckets avoids spending requests on cabin-only photos.
EXTERIOR_IMAGE_SUBTYPES = [
    "Front Plane",
    "Front Right Oblique",
    "Right Plane",
    "Back Right Oblique",
    "Back Plane",
    "Back Left Oblique",
    "Left Plane",
    "Front Left Oblique",
    "Top",
    "Fuel System",
    "Undercarriage",
    "Miscellaneous",
]


@dataclass(frozen=True)
class CirenImageCandidate:
    ciren_id: int
    vehicle_number: int
    subtype: str
    description: str
    object_id: str
    photo_id: int | None
    image_bytes: bytes


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


def extract_case_summary(detail_payload: Dict[str, Any]) -> Dict[str, Any]:
    summary = detail_payload.get("cirenSummary")
    if not isinstance(summary, dict):
        return {}

    return summary


def iter_vehicle_image_candidates(ciren_id: int, detail_payload: Dict[str, Any]) -> Iterable[CirenImageCandidate]:
    session = _build_session()
    seen_object_ids = set()

    for vehicle_number in _unique_vehicle_numbers(detail_payload):
        for subtype in EXTERIOR_IMAGE_SUBTYPES:
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
                    subtype=subtype,
                    description=str(image_entry.get("description") or subtype),
                    object_id=object_id,
                    photo_id=photo_id,
                    image_bytes=image_bytes,
                )