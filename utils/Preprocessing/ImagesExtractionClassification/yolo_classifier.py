import os
from collections import defaultdict

import cv2
from matplotlib import pyplot as plt
from ultralytics import YOLO

from PATHS import (
    CARS_YOLO_MODEL_PATH as carsYoloModelPath,
    PIECES_YOLO_MODEL_PATH as piecesYoloModelPath,
)
from configurations import (
    CARS_CLASSES as carsClasses,
    PIECES_CLASSES as piecesClasses,
)

from configurations import MINIMUM_BOX_AREA_THRESHOLD

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

carsModel = YOLO(carsYoloModelPath)
piecesModel = YOLO(piecesYoloModelPath)


def classify_with_model(image, model, classes=None, draw_outputs=False):
    class_list = model.names
    class_counts = defaultdict(int)

    results = model.predict(image, classes=classes, verbose=False)

    areaImagePixels = image.shape[0] * image.shape[1]
    reallySmallBoxes = 0

    if results[0].boxes is not None and len(results[0].boxes) > 0:
        boxes = results[0].boxes.xyxy.cpu()
        class_indices = results[0].boxes.cls.int().cpu().tolist()

        for box, class_index in zip(boxes, class_indices):
            boxArea = (box[2] - box[0]) * (box[3] - box[1])

            if boxArea / areaImagePixels < MINIMUM_BOX_AREA_THRESHOLD:
                reallySmallBoxes += 1
                #continue

            x1, y1, x2, y2 = map(int, box)
            class_name = class_list[class_index]
            class_counts[class_name] += 1

            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2

            if draw_outputs:
                cv2.circle(image, (center_x, center_y), 4, (0, 0, 255), -1)
                cv2.putText(
                    image,
                    f"{class_name} :{boxArea / areaImagePixels:.2f}",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 0, 0),
                    2,
                )
                cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

    has_detections = reallySmallBoxes < len(results[0].boxes) if results[0].boxes is not None else False

    return image, has_detections


def classify_cars_image(image, draw_outputs=False):
    return classify_with_model(image, carsModel, carsClasses, draw_outputs=draw_outputs)


def classify_pieces_image(image, draw_outputs=False):
    return classify_with_model(image, piecesModel, piecesClasses, draw_outputs=draw_outputs)
