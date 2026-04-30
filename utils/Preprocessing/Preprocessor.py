from openai import OpenAI
from utils.Preprocessing.promptsAI import PROMPTS_EXTRACTION_ORDERING, preprocessExtractionPrompt
import pandas as pd
from PATHS import *
import dotenv


dotenv.load_dotenv()

client = None


def performPreprocessing(filesGPT):
    global client
    
    client = OpenAI()

    IDsFilesGPTDF = pd.read_csv(IDS_NAMES_GPT_FILES_CSV)

    for fileGPT in filesGPT:
        finalResponse = ""
        catalogoImagenes = None
        fileName = IDsFilesGPTDF[IDsFilesGPTDF["ID"] == fileGPT.id]["Nombre"].values[0]

        if("_images" in fileName):
            continue

        onlyImagesGPTFile = IDsFilesGPTDF[IDsFilesGPTDF["Nombre"] == fileName.replace(".pdf", "_images.pdf")]

        for extractionPrompt in PROMPTS_EXTRACTION_ORDERING:

            responsesAPIText = ""

            response = None

            promptElements = [
                {
                    "type": "input_file",
                    "file_id": fileGPT.id,
                }
            ]

            if catalogoImagenes is None:
                responsesAPIText = preprocessExtractionPrompt(extractionPrompt, {}) 
            else:
                responsesAPIText = preprocessExtractionPrompt(extractionPrompt, {'{"CatalogoImagenes"}': catalogoImagenes})


            promptElements.append(
                {
                    "type": "input_text",
                    "text": responsesAPIText,
                }
            )

            if onlyImagesGPTFile is not None:
                promptElements.append(
                    {
                        "type": "input_file",
                        "file_id": onlyImagesGPTFile["ID"].values[0],
                    }
                )

            response = client.responses.create(
                model="gpt-5",
                input=[
                    {
                        "role": "user",
                        "content": promptElements,
                        
                    }
                ]
            )

            responseContent = response.output_text

            if catalogoImagenes is None:
                catalogoImagenes = responseContent

            finalResponse += responseContent + "\n"

        with open(f"{PREPROCESSED_JSONS_PATH}/{fileName}.txt", "w") as textFile:
            textFile.write(finalResponse)

        break

