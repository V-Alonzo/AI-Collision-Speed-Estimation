from openai import OpenAI
from dotenv import load_dotenv
import os
import shutil
from pandas import read_csv

CESVI_REPORTS_PATH_NOT_UPLOADED = None
CESVI_REPORTS_PATH_UPLOADED = None
CESVI_REPORTS_PATH_GENERAL = None
GPT_EXTRACTION_PROMPT = None
client = None

def uploadPDFFileOpenAI(filePath):

    with open("Recursos/Reportes/IDs.csv", "a") as idsFile:
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
            shutil.move(f"{folderPath}/{file}", f"{CESVI_REPORTS_PATH_UPLOADED}/{file}")
    return fileGPTs


def retrieveGPTFile(fileId):
    fileGPT = client.files.retrieve(fileId)
    return fileGPT


def retrieveMissingGptFiles(filesGPT, IDsFilePath):
    IDsSet = set([filesGPT.id for fileGPT in filesGPT])
    IDsCSV = read_csv(IDsFilePath)

    missingFiles = []

    IDsCSVSet = set(IDsCSV["ID"].tolist())

    missingGPTFilesIds = IDsCSVSet - IDsSet

    for missingID in missingGPTFilesIds:
        missingFiles.append(retrieveGPTFile(missingID))

    return missingFiles

def beginInitialConfiguration():
    global CESVI_REPORTS_PATH_NOT_UPLOADED, CESVI_REPORTS_PATH_UPLOADED, CESVI_REPORTS_PATH_GENERAL, GPT_EXTRACTION_PROMPT, client
    load_dotenv(".env")
    CESVI_REPORTS_PATH_NOT_UPLOADED = os.getenv("CESVI_REPORTS_PATH_NOT_UPLOADED")
    CESVI_REPORTS_PATH_UPLOADED = os.getenv("CESVI_REPORTS_PATH_UPLOADED")
    CESVI_REPORTS_PATH_GENERAL = os.getenv("CESVI_REPORTS_PATH_GENERAL")
    GPT_EXTRACTION_PROMPT = os.getenv("INFORMATION_EXTRACTION_GPT_PROMPT")
    client = OpenAI()

def performFilesProcessing():
    beginInitialConfiguration()
    filesGPT = uploadPDFFiles(CESVI_REPORTS_PATH_NOT_UPLOADED)
    filesGPT += retrieveMissingGptFiles(filesGPT, f"{CESVI_REPORTS_PATH_GENERAL}/IDs.csv")

    return filesGPT
