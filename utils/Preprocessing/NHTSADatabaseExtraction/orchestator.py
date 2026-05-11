"""Backward-compatible facade for the NHTSA/CIREN extraction workflows."""

from configurations import CIREN_DEFAULT_CASE_ID_RANGE
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_extractor import beginCirenExtraction
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_extractor import download_valid_ciren_images
from utils.Preprocessing.NHTSADatabaseExtraction.image_validation import isValidImage
from utils.Preprocessing.NHTSADatabaseExtraction.nhtsa_extractor import downloadImage
from utils.Preprocessing.NHTSADatabaseExtraction.nhtsa_extractor import download_valid_images
from utils.Preprocessing.NHTSADatabaseExtraction.nhtsa_extractor import get_json
from utils.Preprocessing.NHTSADatabaseExtraction.nhtsa_extractor import get_valid_test
from utils.Preprocessing.NHTSADatabaseExtraction.nhtsa_extractor import beginNHTSAExtraction




    

def beginExtraction(extraction_from: str = "ciren") -> None:
    """Entry point for the public-dataset extraction workflow. extraction_from can be either 'ciren' or 'nhtsa', and will trigger the corresponding extraction flow."""

    if extraction_from.lower() == "ciren":
        beginCirenExtraction(ciren_ids=list(CIREN_DEFAULT_CASE_ID_RANGE))
    elif extraction_from.lower() == "nhtsa":
        beginNHTSAExtraction()
    else:
        raise ValueError(f"Unsupported extraction source: {extraction_from}. Supported values are 'ciren' and 'nhtsa'.")
