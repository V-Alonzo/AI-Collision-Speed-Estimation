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


def begin_extraction(source_pdf_path):
    print("Starting PDF image extraction and classification pipeline...")
    print(f"Source PDF: '{source_pdf_path}'")
    print("Setting up output directories...")

    output_dirs = build_output_directories(source_pdf_path)

    #Extract images from PDF and classify them as having cars or not
    extract_images_from_pdf(source_pdf_path, output_dirs["cars"], output_dirs["no_cars"], draw_outputs=False)

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
