"""NHTSA API and media extraction workflow helpers."""

import json
import os
from typing import Any, Dict, List, Tuple
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from configurations import NHTSA_ALLOWED_TEST_CONFIGURATIONS
from configurations import NHTSA_REQUEST_TIMEOUT_SECONDS
from configurations import NHTSA_TEST_RESULTS_BASE_URL
from utils.Preprocessing.NHTSADatabaseExtraction.image_validation import isValidImage
from utils.Preprocessing.NHTSADatabaseExtraction.storage_utils import read_cached_results
from utils.Preprocessing.NHTSADatabaseExtraction.storage_utils import write_cached_results


def get_json(url: str) -> Dict[str, Any]:
    """Execute a GET request against the NHTSA API and decode the JSON body."""

    request = Request(url, headers={"Accept": "application/json"})

    try:
        with urlopen(request, timeout=NHTSA_REQUEST_TIMEOUT_SECONDS) as response:
            body = response.read().decode("utf-8")
            return json.loads(body)
    except HTTPError as exc:
        print(f"HTTPError while calling {url}: {exc.code} {exc.reason}")
    except URLError as exc:
        print(f"URLError while calling {url}: {exc.reason}")
    except json.JSONDecodeError:
        print(f"Invalid JSON received from {url}")

    return {}


def _record_nhtsa_error(
    valid_tests: Dict[str, Dict[str, Any]],
    test_no: Any,
    error_message: str,
    output_path: str | None,
) -> None:
    """Persist an NHTSA test error so interrupted runs can resume from cache."""

    valid_tests[str(test_no)] = {"Error": error_message}
    if output_path:
        write_cached_results(output_path, valid_tests)


def _extract_photo_urls(multimedia_results: Any) -> List[str]:
    """Extract media URLs from the multimedia payload returned by NHTSA."""

    if not isinstance(multimedia_results, list) or not multimedia_results:
        raise ValueError("No multimedia results")

    photos = multimedia_results[0].get("photos")
    if not isinstance(photos, list) or not photos:
        raise ValueError("No photos in multimedia results")

    return [photo.get("media") for photo in photos if isinstance(photo.get("media"), str) and photo.get("media")]


def get_valid_test(
    start_page: int = 1,
    end_page: int = 1,
    count: int = 1,
    output_path: str = None,
) -> Tuple[Dict[str, Dict[str, Any]], str | None]:
    """Fetch NHTSA crash tests that have usable metadata and media assets."""

    output_path = f"{output_path}/cacheAPI.json" if output_path else None

    test_configurations = set()

    for page_number in range(start_page, end_page + 1):
        valid_tests = read_cached_results(output_path) if output_path else {}

        print(f"Fetching page {page_number} of test results from NHTSA API...")

        url = f"{NHTSA_TEST_RESULTS_BASE_URL}?pageNumber={page_number}&count={count}&sortBy=DESC"
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

            vehiclesJSON = get_json(f"{NHTSA_TEST_RESULTS_BASE_URL}/get-vehicle-info/{test_no}").get("results", [])

            if test_configuration is not None and test_configuration.upper() not in NHTSA_ALLOWED_TEST_CONFIGURATIONS:
                print(f"Invalid test configuration for test {test_no} in results on page {page_number}. Skipping this item.")
                _record_nhtsa_error(valid_tests, test_no, f"Invalid test configuration: {test_configuration}", output_path)
                continue

            test_configurations.add(test_configuration)

            print(test_configurations)

            for vehiclesTestDict in vehiclesJSON:
                if vehiclesTestDict.get("vehicleModel"):
                    hasVehicleModel = True
                    break

            if not hasVehicleModel:
                print(f"Missing vehicleModel for test {test_no} in results on page {page_number}. Skipping this item.")
                _record_nhtsa_error(valid_tests, test_no, "Missing vehicleModel", output_path)
                continue

            item.update({"Vehicles": vehiclesJSON})

            closing_speed = item.get("closingSpeed")
            if closing_speed is None:
                print(f"Missing closingSpeed for test {test_no} in results on page {page_number}. Skipping this item.")
                _record_nhtsa_error(valid_tests, test_no, "Missing closingSpeed", output_path)
                continue

            try:
                if float(closing_speed) > 0:
                    valid_tests.update({str(test_no): item})
            except (TypeError, ValueError):
                print(f"Invalid closingSpeed value for item in results on page {page_number}. Skipping this item.")
                _record_nhtsa_error(valid_tests, test_no, "Invalid closingSpeed", output_path)
                continue

            print(f"Test {test_no} on page {page_number} passed the filters.")

            print(f"Fetching multimedia URLs for test {test_no}...")

            multimedia_url = f"{NHTSA_TEST_RESULTS_BASE_URL}/get-multimedia-files/{test_no}"
            multimedia_URLs_JSON = get_json(multimedia_url)

            multimedia_Urls = multimedia_URLs_JSON.get("results")

            try:
                photosUrls = _extract_photo_urls(multimedia_Urls)
            except ValueError as exc:
                print(f"{exc} for test {test_no}. Skipping test.")
                _record_nhtsa_error(valid_tests, test_no, str(exc), output_path)
                continue

            item.update({"mediaUrls": photosUrls})
            valid_tests.update({str(test_no): item})

            if output_path:
                write_cached_results(output_path, valid_tests)

        print(
            f"Page {page_number} processed. Valid tests with positive closing speed so far: {len(valid_tests)}. "
            f"Cached results saved to '{output_path}'."
        )

    return valid_tests, output_path


def downloadImage(url: str, output_path: str) -> bool:
    """Download a single remote image and save it to disk."""

    url = url.strip().replace(" ", "%20")

    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})

    try:
        with urlopen(request, timeout=NHTSA_REQUEST_TIMEOUT_SECONDS) as response:
            if response.status != 200:
                print(f"Failed to download {url}: HTTP {response.status}")
                return False

            image_data = response.read()
            with open(output_path, "wb") as file_handle:
                file_handle.write(image_data)
            return True
    except HTTPError as exc:
        print(f"HTTPError while downloading {url}: {exc.code} {exc.reason}")
    except URLError as exc:
        print(f"URLError while downloading {url}: {exc.reason}")
    except Exception as exc:
        print(f"Unexpected error while downloading {url}: {exc}")

    return False


def download_valid_images(valid_tests: Dict[str, Dict[str, Any]], output_dir: str) -> None:
    """Download and validate the media files associated with approved NHTSA tests."""

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

    with open("utils/Preprocessing/NHTSADatabaseExtraction/Extraction/JSONs/cacheAPI.json", "w") as file_handle:
        json.dump(valid_tests, file_handle, indent=4)

def beginNHTSAExtraction():
    """Entry point for the NHTSA-specific extraction workflow."""
    valid_tests, _ = get_valid_test(start_page=1, end_page=4, count=1000, output_path="utils/Preprocessing/NHTSADatabaseExtraction/Extraction/JSONs")
    print(f"Total valid tests with positive closing speed: {len(valid_tests)}")
    download_valid_images(valid_tests, output_dir="utils/Preprocessing/NHTSADatabaseExtraction/Extraction/Images")