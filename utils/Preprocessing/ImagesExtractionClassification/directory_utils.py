import os

from PATHS import PREPROCESSED_IMAGES_PATH as preprocessedImagesPath

def ensure_directory(path):
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Directory '{path}' created.")
    else:
        print(f"Directory '{path}' already exists.")


def build_output_directories(source_pdf_path):
    output_dir_path = f"{preprocessedImagesPath}/{source_pdf_path.split('/')[-1].replace('.pdf', '')}"
    yolo_cars_dir_path = os.path.join(output_dir_path, "YOLOCARS")

    directories = {
        "output": output_dir_path,
        "yolo_cars": yolo_cars_dir_path,
        "cars": os.path.join(yolo_cars_dir_path, "CARS"),
        "no_cars": os.path.join(yolo_cars_dir_path, "NOCARS"),
        "pieces": os.path.join(yolo_cars_dir_path, "PIECES"),
        "no_pieces": os.path.join(yolo_cars_dir_path, "NOPIECES"),
        "photos": os.path.join(yolo_cars_dir_path, "PHOTOS"),
        "no_photos": os.path.join(yolo_cars_dir_path, "NOPHOTOS"),
    }

    for directory_path in directories.values():
        ensure_directory(directory_path)

    return directories
