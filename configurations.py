
"""
Configurations for image preprocessing, classification, and cropping from PDF file.
"""
# Cars classes are = [Bicycle, Car, Motorcycle, Bus, Train, Truck]

CARS_CLASSES = [1, 2, 3, 5, 6, 7]

PIECES_CLASSES = None

# Changing this may lead to bad performance or incorrect results.
# If this is modified, also change the related function.
PHOTO_TEXT_LABELS = [
    "photograph",
    "a 3D render",
    "a drawing",
]

IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tiff")

IS_PHOTOGRAPH_PROBABILITY_THRESHOLD = 0.6