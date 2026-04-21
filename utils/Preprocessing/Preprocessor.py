from openai import OpenAI
from promptsAI import PROMPTS_EXTRACTION_ORDERING, preprocessExtractionPrompt
import pandas as pd
import dotenv
import os


def performPreprocessing(filesGPT):
    client = OpenAI()

    dotenv.load_dotenv()

    idsNamesCSVPath = os.getenv("IDS_NAMES_GPT_FILES_CSV")
    preprocessedJSONsPath = os.getenv("PREPROCESSED_JSONS_PATH")

    IDsFilesGPTDF = pd.read_csv(idsNamesCSVPath)

    for fileGPT in filesGPT:
        finalResponse = ""
        catalogoImagenes = None
        fileName = IDsFilesGPTDF[IDsFilesGPTDF["ID"] == fileGPT.id]["Nombre"].values[0]

        if "6" not in fileName:
            continue

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

        with open(f"{preprocessedJSONsPath}/{fileName}.txt", "w") as textFile:
            textFile.write(finalResponse)
        
        break


