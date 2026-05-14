"""Backward-compatible facade for the NHTSA/CIREN extraction workflows."""

from utils.Preprocessing.NHTSADatabaseExtraction.nhtsa_extractor import beginNHTSAExtraction
from PATHS import CIREN_CACHE_OUTPUT_PATH, CIREN_PARQUET_OUTPUT_DIR
from configurations import CIREN_DEFAULT_CASE_ID_RANGE
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_extractor import refresh_ciren_case_metadata
from utils.Preprocessing.NHTSADatabaseExtraction.ciren_extractor import beginCirenExtraction
from utils.Preprocessing.NHTSADatabaseExtraction.storage_utils import convert_cache_to_parquet

    

def beginExtraction(extraction_from: str = "ciren", just_refresh_cache_and_parquet: bool = False) -> None:
    """Entry point for the public-dataset extraction workflow. extraction_from can be either 'ciren' or 'nhtsa', and will trigger the corresponding extraction flow."""

    if extraction_from.lower() == "ciren":
        if just_refresh_cache_and_parquet:
            refresh_ciren_case_metadata(CIREN_CACHE_OUTPUT_PATH)
        else:
            beginCirenExtraction(ciren_ids=CIREN_DEFAULT_CASE_ID_RANGE)

        convert_cache_to_parquet(CIREN_CACHE_OUTPUT_PATH, CIREN_PARQUET_OUTPUT_DIR)
            
    elif extraction_from.lower() == "nhtsa":
        beginNHTSAExtraction()
    else:
        raise ValueError(f"Unsupported extraction source: {extraction_from}. Supported values are 'ciren' and 'nhtsa'.")
