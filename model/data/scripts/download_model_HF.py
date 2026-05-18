from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="CrashVisionAITeam/CrashedDB", 
    repo_type="dataset",
    allow_patterns="images/*",
    local_dir="/home/mapa/Documents/Tec/8S/2_3_P/reto/data/Images"
)