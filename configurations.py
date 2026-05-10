
"""
Configurations for image preprocessing, classification, and cropping from PDF file.
"""
# Car Classes are [1 - Bicycle 🚲, 2 - Car 🚗, 3 - Motorcycle 🏍️, 5 - Bus 🚌
# 6 - Train 🚆, 7 - Truck 🚛]

CARS_CLASSES = [2,5,7]

# Damaged Classes are {0: "Broken Glass", 1: "Dent", 2: "Scratch", 3: "Wreck"}

DAMAGES_CLASSES = [0, 1, 2, 3]

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