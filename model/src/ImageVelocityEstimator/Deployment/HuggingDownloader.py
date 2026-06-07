from huggingface_hub import hf_hub_download



def download_model_weights(repo_id: str, filename: str, local_dir: str) -> str:
    file_path = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        local_dir=local_dir,
    )

    print(f"File successfully downloaded to: {file_path}")
    return file_path