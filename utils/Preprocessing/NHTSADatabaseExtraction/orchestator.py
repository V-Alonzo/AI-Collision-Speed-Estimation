import json
from typing import Any, Dict, List, Tuple
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import cv2
import os
from pathlib import Path

from configurations import PHOTO_TEXT_LABELS
from utils.Preprocessing.ImagesExtractionClassification.photo_classifier import get_photo_clip_context
from utils.Preprocessing.ImagesExtractionClassification.photo_classifier import is_photograph
from utils.Preprocessing.ImagesExtractionClassification.yolo_classifier import classify_cars_image, classify_damages_image

BASE_URL = "https://nrd.api.nhtsa.dot.gov/nhtsa/vehicle/api/v1/vehicle-database-test-results"


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


def isValidImage(imagePath: str) -> Dict[str, Any]:
    image = cv2.imread(imagePath)
    image, has_cars, boxes = classify_cars_image(image, draw_outputs=True)

    if not has_cars:
        os.remove(imagePath)
        return

    clip_context = get_photo_clip_context(photoTextLabels=PHOTO_TEXT_LABELS)
    isCarPhoto = is_photograph(imagePath, clip_context, [0], [i for i in range(1, len(PHOTO_TEXT_LABELS))])

    if(not isCarPhoto["isPhoto"]):
        os.remove(imagePath)
        return
    
    os.remove(imagePath)

    for idx,box in enumerate(boxes):
        x1, y1, x2, y2 = map(int, box)
        cropped_image = image[y1:y2, x1:x2]
        is_damaged = classify_damages_image(cropped_image, applyMinimumBoxAreaThreshold=False, draw_outputs=True)

        if is_damaged:
            cv2.imwrite(f"{imagePath}_damaged_car_{idx}.jpg", cropped_image)

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
    valid_tests, resultsPath = get_valid_test(start_page=1, end_page=4, count=1000, output_path="utils/Preprocessing/NHTSADatabaseExtraction/Extraction/JSONs")
    print(f"Total valid tests with positive closing speed: {len(valid_tests)}")
    download_valid_images(valid_tests, output_dir="utils/Preprocessing/NHTSADatabaseExtraction/Extraction/Images")