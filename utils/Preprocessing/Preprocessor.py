"""

def performPreprocessing(filesGPT):
    for fileGPT in filesGPT:
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
                                "text": GPT_EXTRACTION_PROMPT,
                            },
                        ]
                    }
                ]
            )

        responseContent = response.output_text

        
"""
