import json
import re
from typing import Any, Dict, List, Tuple
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import cv2
import os
from pathlib import Path

from configurations import PHOTO_TEXT_LABELS
from utils.Preprocessing.ImagesExtractionClassification.photo_classifier import clip_score
from utils.Preprocessing.ImagesExtractionClassification.photo_classifier import get_clip_context
from utils.Preprocessing.ImagesExtractionClassification.photo_classifier import get_photo_clip_context
from utils.Preprocessing.ImagesExtractionClassification.photo_classifier import is_photograph
from utils.Preprocessing.ImagesExtractionClassification.yolo_classifier import classify_cars_image, classify_damages_image
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import extract_case_summary
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import fetch_ciren_case_detail
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import fetch_ciren_case_index
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_client import iter_vehicle_image_candidates

BASE_URL = "https://nrd.api.nhtsa.dot.gov/nhtsa/vehicle/api/v1/vehicle-database-test-results"
VEHICLE_CROP_PADDING_RATIO = 0.08
MINIMUM_VEHICLE_CROP_SIDE_PX = 64
CIREN_IMAGES_OUTPUT_DIR = "utils/Preprocessing/NHTSADatabaseExtraction/Extraction/Images/CIREN"
CIREN_CACHE_OUTPUT_PATH = "utils/Preprocessing/NHTSADatabaseExtraction/Extraction/JSONs/cacheCIREN.json"

_PHOTO_CLIP_CONTEXT = None

def get_json(url: str) -> Dict[str, Any]:
    """Executes a GET request and returns the response as JSON dict."""
    request = Request(url, headers={"Accept": "application/json"})

    try:
        with urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
            return json.loads(body)
    except HTTPError as exc:
        print(f"HTTPError while calling {url}: {exc.code} {exc.reason}")
    except URLError as exc:
        print(f"URLError while calling {url}: {exc.reason}")
    except json.JSONDecodeError:
        print(f"Invalid JSON received from {url}")

    return {}


def get_valid_test(start_page: int = 1, end_page: int = 1, count: int = 1, output_path: str = None) -> Tuple[Dict[str, Dict[str, Any]], str]:

    output_path = f"{output_path}/cacheAPI.json" if output_path else None

    test_configurations = set()

    for page_number in range(start_page, end_page + 1):
        valid_tests: Dict[str, Dict[str, Any]] = json.load(open(output_path, "r")) if output_path and os.path.isfile(output_path) else {}

        print(f"Fetching page {page_number} of test results from NHTSA API...")

        url = f"{BASE_URL}?pageNumber={page_number}&count={count}&sortBy=DESC"
        payload = get_json(url)

        results = payload.get("results")

        print(f"Processing results from page {page_number}...")

        if not isinstance(results, list):
            print(f"Unexpected data format for results on page {page_number}. Skipping this page.")
            continue

        for item in results:
            if not isinstance(item, dict):
                print(f"Unexpected data format for item in results on page {page_number}. Skipping this item.")
                continue

            test_no = item.get("testNo")

            print(f"Analyzing Test No {test_no}")

            if str(test_no) in valid_tests:
                print(f"Test No {test_no} already registered. Skipping this test")
                continue
            if not test_no:
                print(f"Missing testNo for item in results on page {page_number}. Skipping this item.")
                continue

            test_configuration = item.get("testConfiguration")

            hasVehicleModel = False

            vehiclesJSON = get_json(f'https://nrd.api.nhtsa.dot.gov/nhtsa/vehicle/api/v1/vehicle-database-test-results/get-vehicle-info/{test_no}').get("results", [])

            if test_configuration is not None and test_configuration.upper() not in ["IMPACTOR INTO VEHICLE", "VEHICLE INTO BARRIER", "VEHICLE INTO POLE", "VEHICLE INTO POLE", "VEHICLE INTO VEHICLE"]:
                print(f"Invalid test configuration for test {test_no} in results on page {page_number}. Skipping this item.")
                valid_tests.update({str(test_no): {"Error": f"Invalid test configuration: {test_configuration}"}})
                if output_path:
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)

                    with open(output_path, "w") as f:
                        json.dump(valid_tests, f, indent=4)
                continue

            test_configurations.add(test_configuration)

            print(test_configurations)

            for vehiclesTestDict in vehiclesJSON:
                if  vehiclesTestDict.get("vehicleModel"):
                    hasVehicleModel = True
                    break

            if(not hasVehicleModel):
                print(f"Missing vehicleModel for test {test_no} in results on page {page_number}. Skipping this item.")
                valid_tests.update({str(test_no): {"Error": "Missing vehicleModel"}})
                if output_path:
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)

                    with open(output_path, "w") as f:
                        json.dump(valid_tests, f, indent=4)
                continue

            item.update({"Vehicles": vehiclesJSON})

            closing_speed = item.get("closingSpeed")
            if closing_speed is None:
                print(f"Missing closingSpeed for test {test_no} in results on page {page_number}. Skipping this item.")
                valid_tests.update({str(test_no): {"Error": "Missing closingSpeed"}})
                if output_path:
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)

                    with open(output_path, "w") as f:
                        json.dump(valid_tests, f, indent=4)
                continue

            try:
                if float(closing_speed) > 0:
                    valid_tests.update({str(test_no): item})
            except (TypeError, ValueError):
                print(f"Invalid closingSpeed value for item in results on page {page_number}. Skipping this item.")
                valid_tests.update({str(test_no): {"Error": "Invalid closingSpeed"}})
                if output_path:
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)

                    with open(output_path, "w") as f:
                        json.dump(valid_tests, f, indent=4)
                continue

            print(f"Test {test_no} on page {page_number} passed the filters.")

            print(f"Fetching multimedia URLs for test {test_no}...")

            multimedia_url = f"{BASE_URL}/get-multimedia-files/{test_no}"
            multimedia_URLs_JSON = get_json(multimedia_url)

            multimedia_Urls = multimedia_URLs_JSON.get("results")

            if not isinstance(multimedia_Urls, list) or not multimedia_Urls:
                print(f"No multimedia results found for test {test_no}. Skipping test.")
                valid_tests.update({str(test_no): {"Error": "No multimedia results"}})
                if output_path:
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)

                    with open(output_path, "w") as f:
                        json.dump(valid_tests, f, indent=4)
                continue

            photosUrls: List[str] = []

            photos = multimedia_Urls[0]["photos"]

            if photos is None or not isinstance(photos, list) or len(photos) == 0:
                print(f"No photos found in multimedia results for test {test_no}. Skipping test.")
                valid_tests.update({str(test_no): {"Error": "No photos in multimedia results"}})
                if output_path:
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)

                    with open(output_path, "w") as f:
                        json.dump(valid_tests, f, indent=4)
                continue

            for photo in photos:
                media_url = photo.get("media")
                if isinstance(media_url, str) and media_url:
                    photosUrls.append(media_url)

            item.update({"mediaUrls": photosUrls})
            valid_tests.update({str(test_no): item})

            if output_path:
                os.makedirs(os.path.dirname(output_path), exist_ok=True)

                with open(output_path, "w") as f:
                    json.dump(valid_tests, f, indent=4)

        print(f"Page {page_number} processed. Valid tests with positive closing speed so far: {len(valid_tests)}. Cached results saved to '{output_path}'.")

        
    return valid_tests, output_path


def _get_nhtsa_photo_clip_context() -> Dict[str, Any]:
    global _PHOTO_CLIP_CONTEXT

    if _PHOTO_CLIP_CONTEXT is None:
        _PHOTO_CLIP_CONTEXT = get_photo_clip_context(photoTextLabels=PHOTO_TEXT_LABELS)

    return _PHOTO_CLIP_CONTEXT


def _delete_file_if_exists(file_path: str) -> None:
    if os.path.exists(file_path):
        os.remove(file_path)


def _clamp_vehicle_crop_bounds(box, image_width: int, image_height: int) -> Tuple[int, int, int, int] | None:
    x1, y1, x2, y2 = [int(value) for value in box]

    box_width = x2 - x1
    box_height = y2 - y1

    if box_width <= 0 or box_height <= 0:
        return None

    padding_x = max(4, int(box_width * VEHICLE_CROP_PADDING_RATIO))
    padding_y = max(4, int(box_height * VEHICLE_CROP_PADDING_RATIO))

    x1 = max(0, x1 - padding_x)
    y1 = max(0, y1 - padding_y)
    x2 = min(image_width, x2 + padding_x)
    y2 = min(image_height, y2 + padding_y)

    if x2 - x1 < MINIMUM_VEHICLE_CROP_SIDE_PX or y2 - y1 < MINIMUM_VEHICLE_CROP_SIDE_PX:
        return None

    return x1, y1, x2, y2


def _extract_candidate_vehicle_crops(image, boxes) -> List[Tuple[int, Any]]:
    image_height, image_width = image.shape[:2]
    candidate_crops: List[Tuple[int, Any]] = []

    for idx, box in enumerate(boxes):
        crop_bounds = _clamp_vehicle_crop_bounds(box, image_width=image_width, image_height=image_height)

        if crop_bounds is None:
            continue

        x1, y1, x2, y2 = crop_bounds
        cropped_image = image[y1:y2, x1:x2]

        if cropped_image.size == 0:
            continue

        candidate_crops.append((idx, cropped_image))

    return candidate_crops


def _build_damaged_vehicle_output_path(image_path: str) -> str:
    source_path = Path(image_path)
    return str(source_path.with_name(f"{source_path.stem}_damaged_vehicle.jpg"))


def _build_damaged_vehicle_output_path_with_custom_stem(image_path: str, output_stem: str | None = None) -> str:
    if not output_stem:
        return _build_damaged_vehicle_output_path(image_path)

    source_path = Path(image_path)
    return str(source_path.with_name(f"{output_stem}.jpg"))


def isValidImage(imagePath: str, output_stem: str | None = None) -> List[str]:
    image = cv2.imread(imagePath)

    if image is None:
        _delete_file_if_exists(imagePath)
        return []

    image, has_cars, boxes = classify_cars_image(image, draw_outputs=False)

    if not has_cars:
        _delete_file_if_exists(imagePath)
        return []

    clip_context = _get_nhtsa_photo_clip_context()
    isCarPhoto = is_photograph(
        imagePath,
        clip_context,
        [0],
        [i for i in range(1, len(PHOTO_TEXT_LABELS))],
    )

    if(not isCarPhoto["isPhoto"]):
        _delete_file_if_exists(imagePath)
        return []
    
    saved_crops: List[str] = []

    image, is_damaged, boxes = classify_damages_image(image, applyMinimumBoxAreaThreshold=False, draw_outputs=False)

    if not is_damaged:
        _delete_file_if_exists(imagePath)
        return []

    output_path = _build_damaged_vehicle_output_path_with_custom_stem(imagePath, output_stem=output_stem)
    cv2.imwrite(output_path, image)
    saved_crops.append(output_path)

    _delete_file_if_exists(imagePath)

    return saved_crops


def _sanitize_metadata_for_filename(value: Any, fallback: str = "Unknown") -> str:
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


def _read_cached_results(cache_path: str) -> Dict[str, Dict[str, Any]]:
    if os.path.isfile(cache_path):
        with open(cache_path, "r") as cache_file:
            payload = json.load(cache_file)
            if isinstance(payload, dict):
                return payload
    return {}


def _write_cached_results(cache_path: str, payload: Dict[str, Dict[str, Any]]) -> None:
    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    with open(cache_path, "w") as cache_file:
        json.dump(payload, cache_file, indent=4)


def _build_ciren_output_stem(summary: Dict[str, Any], sequence: int, vehicle_number: Any = None) -> str:

    total_delta_v = summary.get("totalDeltaV") or summary.get("highestDeltaVTotal") or "UnknownDeltaV"
    severity = summary.get("mais") or summary.get("severityDescription") or "UnknownSeverity"
    vehicle_number = f"Vehicle{vehicle_number}" if vehicle_number is not None else "UnknownVehicle"

    return (
        f"{_sanitize_metadata_for_filename(total_delta_v)}_"
        f"{_sanitize_metadata_for_filename(severity)}_"
        f"{sequence:03d}_"
        f"{_sanitize_metadata_for_filename(vehicle_number)}"
    )


def _build_ciren_case_output_dir(case_number: Any, output_dir: str) -> str:
    normalized_case_number = _sanitize_metadata_for_filename(case_number, fallback="UnknownCase")
    return os.path.join(output_dir, normalized_case_number)


def _save_ciren_candidate_image(image_bytes: bytes, output_path: str) -> None:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as image_file:
        image_file.write(image_bytes)


def download_valid_ciren_images(
    output_dir: str = CIREN_IMAGES_OUTPUT_DIR,
    cache_path: str = CIREN_CACHE_OUTPUT_PATH,
    ciren_ids: List[int] | None = None,
) -> Dict[str, Dict[str, Any]]:
    cached_cases = _read_cached_results(cache_path)

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
        if cached_case.get("validatedImages"):
            print(f"CIREN case {ciren_id} already processed. Skipping.")
            continue

        print(f"Processing CIREN case {ciren_id}...")

        case_payload: Dict[str, Any] = {
            "cirenId": ciren_id,
            "make": case_entry.get("make"),
            "model": case_entry.get("model"),
            "modelYear": case_entry.get("modelYear"),
            "errors": [],
            "validatedImages": [],
            "candidateImages": [],
        }

        try:
            detail_payload = fetch_ciren_case_detail(ciren_id)
            summary = extract_case_summary(detail_payload)

            case_payload.update(
                {
                    "caseId": summary.get("caseId"),
                    "caseNumber": summary.get("cirenId") or ciren_id,
                    "mais": summary.get("mais"),
                    "totalDeltaV": summary.get("totalDeltaV"),
                    "objectContact": summary.get("objectContact"),
                    "category": summary.get("category"),
                    "vehicleMake": summary.get("make"),
                    "vehicleModel": summary.get("model"),
                    "vehicleModelYear": summary.get("modelYear"),
                }
            )

            case_output_dir = _build_ciren_case_output_dir(case_payload["caseNumber"], output_dir)
            os.makedirs(case_output_dir, exist_ok=True)

            validated_sequence = 1
            candidate_sequence = 1
            for image_candidate in iter_vehicle_image_candidates(ciren_id, detail_payload):
                output_stem = _build_ciren_output_stem(summary, validated_sequence, image_candidate.vehicle_number)
                candidate_stem = f"__candidate__{_build_ciren_output_stem(summary, candidate_sequence, image_candidate.vehicle_number)}"
                candidate_file_path = os.path.join(case_output_dir, f"{candidate_stem}.jpg")
                _save_ciren_candidate_image(image_candidate.image_bytes, candidate_file_path)

                try:
                    validated_images = isValidImage(candidate_file_path, output_stem=output_stem)
                finally:
                    _delete_file_if_exists(candidate_file_path)

                case_payload["candidateImages"].append(
                    {
                        "vehicleNumber": image_candidate.vehicle_number,
                        "subtype": image_candidate.subtype,
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
                if not os.listdir(case_output_dir):
                    os.rmdir(case_output_dir)

            if os.listdir(case_output_dir) == []:
                os.rmdir(case_output_dir)

        except Exception as exc:
            case_payload["errors"].append(str(exc))

        cached_cases[cache_key] = case_payload
        _write_cached_results(cache_path, cached_cases)

    return cached_cases

def downloadImage(url: str, output_path: str) -> bool:
    """Downloads an image from a URL and saves it to the specified output path."""
    # Sanitize URL.
    url = url.strip().replace(" ", "%20")

    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})

    try:
        with urlopen(request, timeout=30) as response:
            if response.status != 200:
                print(f"Failed to download {url}: HTTP {response.status}")
                return False

            image_data = response.read()
            with open(output_path, "wb") as f:
                f.write(image_data)
            return True
    except HTTPError as exc:
        print(f"HTTPError while downloading {url}: {exc.code} {exc.reason}")
    except URLError as exc:
        print(f"URLError while downloading {url}: {exc.reason}")
    except Exception as exc:
        print(f"Unexpected error while downloading {url}: {exc}")

    return False

def download_valid_images(valid_tests: Dict[str, Dict[str, Any]], output_dir: str) -> None:
    """Downloads images from the multimedia data and saves them to the output directory."""

    toDeleteTestNo = []

    for test_no in valid_tests:
        item = valid_tests[test_no]

        print(f"Processing test {test_no}...")

        if "Error" in item:
            print(f"Skipping test {test_no} due to previous error: {item['Error']}")
            continue

        media_urls = item.get("mediaUrls", [])
        
        if os.path.exists(f"{output_dir}/{test_no}"):
            print(f"Directory for test {test_no} already exists. Skipping download for this test.")
            continue

        for url in media_urls:
            fileName = url.split("/")[-1]

            os.makedirs(f"{output_dir}/{test_no}", exist_ok=True)

            fileName = f"{item['closingSpeed']}_{fileName}"

            output_path = f"{output_dir}/{test_no}/{fileName}"
            success = downloadImage(url, output_path)
            if success:
                print(f"Downloaded {url} to {output_path}")
                isValidImage(output_path)
            else:
                print(f"Failed to download {url}")
        
        if os.listdir(f"{output_dir}/{test_no}") == []:
            print(f"No valid images downloaded for test {test_no}. Removing empty directory.")
            os.rmdir(f"{output_dir}/{test_no}")
            toDeleteTestNo.append(test_no)

    for test_no in toDeleteTestNo:
        print(f"Removing test {test_no} from valid tests due to lack of valid images.")
        del valid_tests[test_no]

    with open(f"utils/Preprocessing/NHTSADatabaseExtraction/Extraction/JSONs/cacheAPI.json", "w") as f:
        json.dump(valid_tests, f, indent=4)


def beginExtraction():
    #valid_tests, resultsPath = get_valid_test(start_page=1, end_page=4, count=1000, output_path="utils/Preprocessing/NHTSADatabaseExtraction/Extraction/JSONs")
    beginCirenExtraction(ciren_ids= list(range(1,5000)))
    #print(f"Total valid tests with positive closing speed: {len(valid_tests)}")
    #download_valid_images(valid_tests, output_dir="utils/Preprocessing/NHTSADatabaseExtraction/Extraction/Images")


def beginCirenExtraction(ciren_ids: List[int] | None = None):
    ciren_cases = download_valid_ciren_images(
        output_dir=CIREN_IMAGES_OUTPUT_DIR,
        cache_path=CIREN_CACHE_OUTPUT_PATH,
        ciren_ids=ciren_ids,
    )
    valid_case_count = sum(1 for case_payload in ciren_cases.values() if case_payload.get("validatedImages"))
    print(f"Total CIREN cases with validated damaged vehicle photos: {valid_case_count}")