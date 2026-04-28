from utils.Preprocessing.ImagesExtractionClassification.directory_utils import (
    build_output_directories,
)
from utils.Preprocessing.ImagesExtractionClassification.pdf_extractor import (
    extract_images_from_pdf,
)
from utils.Preprocessing.ImagesExtractionClassification.pieces_classifier import (
    classify_pieces_from_no_cars,
)
from utils.Preprocessing.ImagesExtractionClassification.photos_classifier import (
    classify_photos_from_cars_and_pieces,
)

from utils.Preprocessing.ImagesExtractionClassification.photos_classifier import (
    remove_duplicate_images,
)
from utils.Preprocessing.ImagesExtractionClassification.pdf_creator import (
    generate_images_pdf,
)


import shutil

def begin_extraction(source_pdf_path):

    output_dirs = build_output_directories(source_pdf_path)

    print("Starting PDF image extraction and classification pipeline...")
    print(f"Source PDF: '{source_pdf_path}'")
    print("Setting up output directories...")

    #Extract images from PDF and classify them as having cars or not
    extract_images_from_pdf(source_pdf_path, output_dirs["cars"], output_dirs["no_cars"], draw_outputs=False)

    remove_duplicate_images(output_dirs["cars"])
    remove_duplicate_images(output_dirs["no_cars"])

    #Classify images without cars as having pieces or not.
    classify_pieces_from_no_cars(
        output_dirs["no_cars"],
        output_dirs["pieces"],
        output_dirs["no_pieces"],
    )
    
    #Classify images with cars and pieces as photos or not.
    classify_photos_from_cars_and_pieces(
        output_dirs["cars"],
        output_dirs["pieces"],
        output_dirs["photos"],
        output_dirs["no_photos"],
    )

    #Remove unnecessary directories
    shutil.rmtree(output_dirs["cars"])
    shutil.rmtree(output_dirs["no_cars"])
    shutil.rmtree(output_dirs["pieces"])
    shutil.rmtree(output_dirs["no_pieces"])
    shutil.rmtree(output_dirs["no_photos"])

    # Generate PDF with the classified photos
    generate_images_pdf(output_dirs["photos"], output_dirs["yolo_cars"], output_dirs["output"].split("/")[-1])

    print("Pipeline of Images Extraction and Classification completed.")