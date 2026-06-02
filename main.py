#from utils.Preprocessing.orchestator import beginPreprocessing
#from utils.Preprocessing.NHTSADatabaseExtraction.orchestator import beginExtraction
from utils.Preprocessing.HuggingFaceExtraction.HF_DB_Pipeline import PreprocessingHuggingFaceDB

import datetime


if __name__ == "__main__":
    start = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[start] " + str(start) + "\033[0m" + "\n")

    #this function will trigger the extraction of either the CIREN or NHTSA datasets, depending on the argument provided. By default, it will extract from CIREN.
    #beginExtraction(extraction_from="ciren", just_refresh_cache_and_parquet=False)
    PreprocessingHuggingFaceDB()
    
    #beginPreprocessing()
    


    
    end = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[end] "+ str(end) + "\033[0m" + "\n")
    print(f"Total Execution Time: {(end - start).total_seconds():.2f} seconds")