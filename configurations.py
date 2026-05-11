
"""Project-level configuration values used by preprocessing pipelines.

Only tunable values live here. Workflow decisions and control flow stay in the
owning modules so behavior remains explicit and easier to follow.
"""
# Car Classes are [1 - Bicycle 🚲, 2 - Car 🚗, 3 - Motorcycle 🏍️, 5 - Bus 🚌
# 6 - Train 🚆, 7 - Truck 🚛]

CARS_CLASSES = [2,5,7]

# Damaged Classes are {0: "Broken Glass", 1: "Dent", 2: "Scratch", 3: "Wreck"}

DAMAGES_CLASSES = [1, 3]

PIECES_CLASSES = None

# Changing this may lead to bad performance or incorrect results.
# If this is modified, also change the related function.
PHOTO_TEXT_LABELS = [
    "Full body shot of a vehicle.",
    "a 3D render",
    "a drawing",
    "a diagram",
    "satelital image",
    "photograph of the interior of a vehicle.",
]

IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tiff")

IS_PHOTOGRAPH_PROBABILITY_THRESHOLD = 0.65
YOLO_CONFIDENCE_THRESHOLD = 0.7
MINIMUM_BOX_AREA_THRESHOLD = 0.25 #Percentage

# NHTSA extraction settings.
NHTSA_TEST_RESULTS_BASE_URL = "https://nrd.api.nhtsa.dot.gov/nhtsa/vehicle/api/v1/vehicle-database-test-results"
NHTSA_REQUEST_TIMEOUT_SECONDS = 30
NHTSA_ALLOWED_TEST_CONFIGURATIONS = (
    "IMPACTOR INTO VEHICLE",
    "VEHICLE INTO BARRIER",
    "VEHICLE INTO POLE",
    "VEHICLE INTO VEHICLE",
)

# Crash Viewer CIREN extraction settings.
CIREN_BASE_URL = "https://crashviewer.nhtsa.dot.gov"
CIREN_REQUEST_TIMEOUT_SECONDS = 60
CIREN_CASE_OVERVIEW_MODE = 3
CIREN_REQUIRED_METADATA_KEYS = (
    "bodyCategory",
    "bodyType",
    "vehicleClass",
    "vehicleHasTrailer",
)
CIREN_IGNORED_SUBTYPE_KEYWORDS = (
    "INTERIOR",
    "EXEMPLAR",
    "INT",
    "MISCELLANEOUS",
    "UNDERCARRIAGE",
    "TOP",
)
CIREN_IGNORED_DESCRIPTION_KEYWORDS = ("TIRE",)
CIREN_DEFAULT_CASE_ID_RANGE = range(1, 5000)