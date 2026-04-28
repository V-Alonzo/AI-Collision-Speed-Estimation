import os

import cv2
import fitz
import numpy as np

from utils.Preprocessing.ImagesExtractionClassification.yolo_classifier import classify_cars_image


def crop_pdf(file_path, image_name, page_id, crop_coordinates):
    document = fitz.open(file_path)
    page = document[page_id]
    rectangle = fitz.Rect(*crop_coordinates)
    pixmap = page.get_pixmap(clip=rectangle)
    pixmap.save(image_name)
    document.close()


def extract_images_from_pdf(pdf_path, cars_output_dir_path, no_cars_output_dir_path, draw_outputs=False):
    print("Extracting images with cars from PDF...")
    document = fitz.open(pdf_path)

    for page_index in range(len(document)):
        for image_data in document.get_page_images(page_index):
            x_ref = image_data[0]
            pixmap = fitz.Pixmap(document, x_ref)

            if pixmap.n >= 5:
                pixmap = fitz.Pixmap(fitz.csRGB, pixmap)

            image_bytes = pixmap.tobytes("png")
            image_np = np.frombuffer(image_bytes, dtype=np.uint8)
            image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

            if image is None:
                pixmap = None
                continue

            modified_image, has_cars = classify_cars_image(image, draw_outputs=draw_outputs)

            if has_cars:
                output_path = os.path.join(cars_output_dir_path, f"page_{page_index}_img_{x_ref}_HASCARS.png")
            else:
                output_path = os.path.join(no_cars_output_dir_path, f"page_{page_index}_img_{x_ref}_NOCARS.png")

            cv2.imwrite(output_path, modified_image)
            pixmap = None

    document.close()
