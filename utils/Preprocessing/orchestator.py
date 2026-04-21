from filesManager import performFilesProcessing
from Preprocessor import performPreprocessing


filesGPT = performFilesProcessing()

jsonConversions = performPreprocessing(filesGPT)