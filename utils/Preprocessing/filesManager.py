from openai import OpenAI
import os
import shutil
from pandas import read_csv
from PATHS import *
import dotenv


client = None
dotenv.load_dotenv()


def uploadPDFFileOpenAI(filePath):

    with open(IDS_NAMES_GPT_FILES_CSV, "a") as idsFile:
        with open(filePath, "rb") as reportFile:
            fileGPT = client.files.create(
                file = reportFile,
                purpose="user_data"
            )
            idsFile.write(f"{fileGPT.id},{filePath.split('/')[-1]}\n")
        return fileGPT


def uploadPDFFiles(folderPath):
    fileGPTs = []
    for file in os.listdir(folderPath):
        if file.endswith(".pdf"):
            fileGPT = uploadPDFFileOpenAI(f"{folderPath}/{file}")
            fileGPTs.append(fileGPT)
            shutil.move(f"{folderPath}/{file}", f"{REPORTS_PATH_UPLOADED}/{file}")
    return fileGPTs


def retrieveGPTFile(fileId):
    fileGPT = client.files.retrieve(fileId)
    return fileGPT


def retrieveMissingGptFiles(filesGPT, IDsFilePath):
    IDsSet = set([fileGPT.id for fileGPT in filesGPT])
    IDsCSV = read_csv(IDsFilePath)

    missingFiles = []

    IDsCSVSet = set(IDsCSV["ID"].tolist())

    missingGPTFilesIds = IDsCSVSet - IDsSet

    for missingID in missingGPTFilesIds:
        missingFiles.append(retrieveGPTFile(missingID))

    return missingFiles

def beginInitialConfiguration():
    global client
    client = OpenAI()

def performFilesProcessing():
    beginInitialConfiguration()
    filesGPT = uploadPDFFiles(REPORTS_PATH_NOT_UPLOADED)
    filesGPT += retrieveMissingGptFiles(filesGPT, f"{REPORTS_PATH_GENERAL}/IDs.csv")

    return filesGPT
    
