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

        for extractionPrompt in PROMPTS_EXTRACTION_ORDERING:

            responsesAPIText = ""

            if catalogoImagenes is None:
                responsesAPIText = preprocessExtractionPrompt(extractionPrompt, {})
            else:
                responsesAPIText = preprocessExtractionPrompt(extractionPrompt, {'{"CatalogoImagenes"}': catalogoImagenes})

            response = client.responses.create(
                model="gpt-5",
                input=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_file",
                                "file_id": fileGPT.id,
                            },
                            {
                                "type": "input_text",
                                "text": responsesAPIText,
                            },
                        ]
                    }
                ]
            )

            responseContent = response.output_text

            if catalogoImagenes is None:
                catalogoImagenes = responseContent

            finalResponse += responseContent + "\n"

        with open(f"{PREPROCESSED_JSONS_PATH}/{fileName}.txt", "w") as textFile:
            textFile.write(finalResponse)

