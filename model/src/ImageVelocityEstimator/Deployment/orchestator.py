import json
import os
from pathlib import Path

import torch
from PIL import Image
from torchvision import transforms

from model.src.ImageVelocityEstimator.Deployment.HuggingDownloader import download_model_weights
from model.src.ImageVelocityEstimator.Deployment.inference_model import (
    build_velocity_network_v1,
)


DEFAULT_REPO_ID = "CrashVisionAITeam/VelocityEstimator"
DEFAULT_WEIGHTS_FILENAME = "ImagVelEst_aug_ModFc_EmbHead_l1Loss_v1/serialized/ImagVelEst_aug_ModFc_EmbHead_l1Loss_v1_weights.pth"
DEFAULT_LOCAL_DIR = "model/src/ImageVelocityEstimator/Deployment"
DEFAULT_MODEL_ARCHITECTURE_JSON_PATH = (
    "model/experiments/ImagVelEst_aug_ModFc_EmbHead_l1Loss_v1/model_architecture.json"
)
DEFAULT_MODEL_DESCRIPTION_PATH = (
    "model/experiments/ImagVelEst_aug_ModFc_EmbHead_l1Loss_v1/description.md"
)
DEFAULT_SMOKE_TEST_IMAGE_DIR = Path(
    "model/src/ImageVelocityEstimator/Deployment/ExampleImages"
)
SUPPORTED_SMOKE_TEST_EXTENSIONS = {".jpg"}
SMOKE_TEST_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ]
)


def build_model():
    return build_velocity_network_v1()


def load_model_description_markdown(markdown_path: str):
    if not os.path.exists(markdown_path):
        print(f"Model description file not found at: {markdown_path}")
        return None

    with open(markdown_path, "r") as markdown_file:
        model_description = markdown_file.read()

    print(f"Model description successfully loaded from: {markdown_path}")
    return model_description


def load_model_architecture_from_json(json_path: str):
    if not os.path.exists(json_path):
        print(f"Model architecture file not found at: {json_path}")
        return None

    with open(json_path, "r") as json_file:
        model_architecture = json.load(json_file)

    print(f"Model architecture successfully loaded from: {json_path}")
    return model_architecture


def extract_model_state_dict(weights_path: str, device: str = "cpu"):
    state_dict = torch.load(weights_path, map_location=device)

    if isinstance(state_dict, dict) and "state_dict" in state_dict:
        state_dict = state_dict["state_dict"]

    if not isinstance(state_dict, dict):
        raise ValueError(
            "The downloaded weights file does not contain a valid state_dict."
        )

    model_state_dict = {
        key.replace("model.", "", 1): value
        for key, value in state_dict.items()
        if key.startswith("model.")
    }

    if model_state_dict:
        return model_state_dict

    return state_dict


def load_weights_into_model(model, weights_path: str, device: str = "cpu"):
    state_dict = extract_model_state_dict(weights_path, device=device)
    load_result = model.load_state_dict(state_dict, strict=False)

    if load_result.missing_keys or load_result.unexpected_keys:
        raise RuntimeError(
            "Weights do not match the expected v1 inference architecture. "
            f"Missing keys: {load_result.missing_keys}. "
            f"Unexpected keys: {load_result.unexpected_keys}."
        )

    model.to(device)
    model.eval()

    print(f"Model weights successfully loaded from: {weights_path}")
    return model


def get_smoke_test_image_path(image_dir: Path = DEFAULT_SMOKE_TEST_IMAGE_DIR) -> Path:
    if not image_dir.exists():
        raise FileNotFoundError(
            f"Smoke test image directory not found at: {image_dir}"
        )

    valid_images = sorted(
        file_path
        for file_path in image_dir.iterdir()
        if file_path.is_file()
        and file_path.suffix.lower() in SUPPORTED_SMOKE_TEST_EXTENSIONS
    )

    if not valid_images:
        raise FileNotFoundError(
            f"No supported smoke test images were found in: {image_dir}"
        )

    return valid_images[0]


def run_smoke_test(model, device: str = "cpu"):
    image_path = get_smoke_test_image_path()
    image = Image.open(image_path).convert("RGB")
    transformed_image = SMOKE_TEST_TRANSFORM(image).unsqueeze(0).to(device)

    with torch.inference_mode():
        prediction = model(transformed_image)

    print(
        "Smoke test completed. "
        f"Image path: {image_path} | "
        f"Output shape: {tuple(prediction.shape)} | "
        f"Output dtype: {prediction.dtype} | "
        f"Output device: {prediction.device} | "
        f"Prediction value: {prediction.item() if prediction.numel() == 1 else 'N/A'}"
    )
    return prediction



def start_deployment_preparations(device: str = "cpu"):
    repo_id = DEFAULT_REPO_ID
    filename_pth = DEFAULT_WEIGHTS_FILENAME
    local_dir_pth_file = DEFAULT_LOCAL_DIR
    model_architecture_json_path = DEFAULT_MODEL_ARCHITECTURE_JSON_PATH
    model_description_path = DEFAULT_MODEL_DESCRIPTION_PATH

    weights_path = os.path.join(local_dir_pth_file, filename_pth)

    if not os.path.exists(weights_path):
        download_model_weights(repo_id, filename_pth, local_dir_pth_file)

    if os.path.exists(weights_path):
        print(f"Model weights are ready at: {weights_path}")
    else:
        print("Failed to download the model weights.")
        return

    model_description = load_model_description_markdown(model_description_path)
    if model_description is None:
        print("Failed to load the model description.")
        return

    model_architecture = load_model_architecture_from_json(model_architecture_json_path)
    if model_architecture is None:
        print("Failed to load the model architecture.")
        return

    model = build_model()
    model = load_weights_into_model(model, weights_path, device=device)
    
    run_smoke_test(model, device=device)

    return {
        "model": model,
        "weights_path": weights_path,
        "model_architecture": model_architecture,
        "model_description": model_description,
    }



if __name__ == "__main__":

    #Execute this file with: python -m model.src.ImageVelocityEstimator.Deployment.orchestator
    model_data = start_deployment_preparations()