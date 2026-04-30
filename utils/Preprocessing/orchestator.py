from utils.Preprocessing.filesManager import performFilesProcessing
from utils.Preprocessing.Preprocessor import performPreprocessing
import os
from PATHS import *
from utils.Preprocessing.ImagesExtractionClassification import orchestator as imageProcessingOrchestator

def extractImagesFromUploadedPDFs():
    for fileName in os.listdir(REPORTS_PATH_UPLOADED):
        if fileName.endswith(".pdf"):
            sourcePDFPath = f"{REPORTS_PATH_UPLOADED}/{fileName}"
            imageProcessingOrchestator.begin_extraction(sourcePDFPath)

def beginPreprocessing():
    filesGPT = performFilesProcessing()
    
    #extractImagesFromUploadedPDFs()

    jsonConversions = performPreprocessing(filesGPT)
