import os

import cv2

from utils.Preprocessing.ImagesExtractionClassification.yolo_classifier import classify_pieces_image

from configurations import IMAGE_EXTENSIONS

def classify_pieces_from_no_cars(no_cars_input_dir_path, pieces_output_dir_path, no_pieces_output_dir_path, draw_outputs=False):
    print("Looking for pieces in images without cars...")
    if not os.path.exists(no_cars_input_dir_path):
        print(f"NOCARS directory does not exist: '{no_cars_input_dir_path}'")
        return

    for file_name in sorted(os.listdir(no_cars_input_dir_path)):
        input_path = os.path.join(no_cars_input_dir_path, file_name)

        if not os.path.isfile(input_path):
            continue

        if not file_name.lower().endswith(IMAGE_EXTENSIONS):
            continue

        image = cv2.imread(input_path)
        if image is None:
            print(f"Could not read image: '{input_path}'")
            continue

        modified_image, has_pieces = classify_pieces_image(image, draw_outputs=draw_outputs)

        base_name, _ = os.path.splitext(file_name)

        if has_pieces:
            output_path = os.path.join(pieces_output_dir_path, f"{base_name}_HASPIECES.png")
        else:
            output_path = os.path.join(no_pieces_output_dir_path, f"{base_name}_NOPIECES.png")

        cv2.imwrite(output_path, modified_image)
