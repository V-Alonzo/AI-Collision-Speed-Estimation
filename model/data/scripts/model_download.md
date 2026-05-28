
# Dataset Timeline for Training

- First trained model (VelocityEstimator_640_691_4559samples) with dataset: "CrashVisionAITeam/CrashedDB" 

- Second trained model ( ) with dataset: "CrashVisionAITeam/CrashedDBAugmented" 


# Note

Export in your unix terminal a huggingface access token for better download speed:
export HF_TOKEN="your_token"
export HF_XET_HIGH_PERFORMANCE=1



# Downloading Method Alternative

If huggingface_hub's snapshot_download method presents downloading issues, you can always clone directly the huggingface dataset with:

git clone https://huggingface.co/datasets/CrashVisionAITeam/CrashedDBAugmented

For unix terminal you might need to install certain tools before dataset clone process: 
sudo apt install git-lfs
git lfs install