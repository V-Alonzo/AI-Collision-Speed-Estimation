import os
import tempfile

import fitz
from PIL import Image

from utils.Preprocessing.filesManager import uploadPDFFileOpenAI

def uploadPDFFileToGPTFiles(pdf_path):

    uploadPDFFileOpenAI(pdf_path)


def generate_images_pdf(images_directory, output_pdf_path, pdf_name):

    images = os.listdir(images_directory)
    
    final_pdf_path = os.path.join(output_pdf_path, f"{pdf_name}_images.pdf")

    with tempfile.TemporaryDirectory() as temp_dir:
        individual_pdfs = []

        # 1) Convertir cada imagen a un PDF individual
        for index, image_name in enumerate(images, start=1):
            image_path = os.path.join(images_directory, image_name)
            image_pdf_path = os.path.join(temp_dir, f"{index:05d}.pdf")

            with Image.open(image_path) as image:
                rgb_image = image.convert("RGB")
                rgb_image.save(image_pdf_path, "PDF")
                rgb_image.close()

            individual_pdfs.append(image_pdf_path)

        # 2) Unir todos los PDFs individuales en uno solo
        merged_pdf = fitz.open()
        try:
            for pdf_path in individual_pdfs:
                with fitz.open(pdf_path) as single_pdf:
                    merged_pdf.insert_pdf(single_pdf)
            merged_pdf.save(final_pdf_path)
        finally:
            merged_pdf.close()

    uploadPDFFileToGPTFiles(final_pdf_path)

    return final_pdf_path