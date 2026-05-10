import os
import shutil

from utils.Preprocessing.ImagesExtractionClassification.photo_classifier import (
    get_photo_clip_context,
    is_photograph,
    
)

from configurations import IMAGE_EXTENSIONS

from imagededup.methods import PHash
from imagededup.utils import plot_duplicates


def remove_duplicate_images(photos_dir):
    print(f"Detecting duplicate images in {photos_dir}...")

    p_hasher = PHash()

    encodings = p_hasher.encode_images(photos_dir)

    duplicates = p_hasher.find_duplicates(encoding_map=encodings, max_distance_threshold=0)

    duplicatedImageNames = [key for key in duplicates if len(duplicates[key]) > 0]
    duplicatedImageNames = set(duplicatedImageNames)

    for duplicatedImageName in duplicatedImageNames:
        os.remove(os.path.join(photos_dir, duplicatedImageName))

    print(f"Duplicate images removed: {len(duplicatedImageNames)}")



def classify_photos_from_cars_and_pieces(
    cars_input_dir_path,
    pieces_input_dir_path,
    photos_output_dir_path,
    no_photos_output_dir_path,
):
    print("Looking for photos in images with cars and pieces...")
    clip_context = get_photo_clip_context(generateNewContext=True)

    source_directories = [
        ("CARS", cars_input_dir_path),
        ("PIECES", pieces_input_dir_path),
    ]

    photo_count = 0
    non_photo_count = 0

    for source_name, source_directory in source_directories:
        if not os.path.exists(source_directory):
            print(f"{source_name} directory does not exist: '{source_directory}'")
            continue

        for file_name in sorted(os.listdir(source_directory)):
            input_path = os.path.join(source_directory, file_name)

            if not os.path.isfile(input_path):
                continue

            if not file_name.lower().endswith(IMAGE_EXTENSIONS):
                continue

            try:
                photo_result = is_photograph(input_path, clip_context)
            except Exception as error:
                print(f"Could not classify image '{input_path}' as photo/non-photo: {error}")
                continue

            output_file_name = f"{source_name}_{file_name}"

            if photo_result["isPhoto"]:
                output_path = os.path.join(photos_output_dir_path, output_file_name)
                photo_count += 1
            else:
                output_path = os.path.join(no_photos_output_dir_path, output_file_name)
                non_photo_count += 1

            shutil.copy2(input_path, output_path)

    print(f"Photo classification completed. PHOTOS={photo_count}, NOPHOTOS={non_photo_count}")
