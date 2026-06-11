from huggingface_hub import snapshot_download
from model.config.libraries import *

def download_huggingface_dataset(
        repo_id,
        dir_to_save_data
        ):
    try:
        snapshot_download(
            repo_id=repo_id, 
            repo_type="dataset",
            allow_patterns="images/*",
            local_dir=dir_to_save_data,
            max_workers=15
        )
    except Exception as e:
        print(f"Data download was not completed successfully... {e}")


if __name__ == "__main__":

    start = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[start] " + str(start) + "\033[0m" + "\n");
    download_huggingface_dataset(
        repo_id = "CrashVisionAITeam/CrashedDB",
        dir_to_save_data= "utils/Preprocessing/NHTSADatabaseExtraction/Extraction/Images"
        
    )
    end = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[end] "+ str(end) + "\033[0m" + "\n");

    exectime= end - start
    print("Exectime: ",exectime.total_seconds() )