import io
import json
import os
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import boto3
from botocore.exceptions import ClientError
import torch
import torch.nn.functional as F
from PIL import Image
from torch import nn
from torchvision import transforms
from torchvision.models import resnet50


PROJECT_ROOT = Path(__file__).resolve().parent
DEFAULT_REPO_ID = "CrashVisionAITeam/VelocityEstimator"
DEFAULT_WEIGHTS_FILENAME = "ImagVelEst_aug_ModFc_EmbHead_l1Loss_v1_weights.pth"
DEFAULT_TMP_MODEL_DIR = Path("/tmp/ai-image-model")
DEFAULT_S3_BUCKET = os.environ.get("AI_VEL_BUCKET", "ai-vel-bucket")
DEFAULT_S3_MODEL_PREFIX = os.environ.get("AI_VEL_MODEL_PREFIX", "ai-image-model")
DEFAULT_IMAGE_URL_EVENT_KEY = "ImageURL"
DEFAULT_DEVICE = os.environ.get("AI_VEL_DEVICE", "cpu")
DEFAULT_MODEL_ARCHITECTURE_JSON_PATH = PROJECT_ROOT / (
    "model/experiments/ImagVelEst_aug_ModFc_EmbHead_l1Loss_v1/model_architecture.json"
)
DEFAULT_MODEL_DESCRIPTION_PATH = PROJECT_ROOT / (
    "model/experiments/ImagVelEst_aug_ModFc_EmbHead_l1Loss_v1/description.md"
)
DEFAULT_SMOKE_TEST_IMAGE_DIR = PROJECT_ROOT / (
    "model/src/ImageVelocityEstimator/Deployment/ExampleImages"
)
SUPPORTED_SMOKE_TEST_EXTENSIONS = {".jpg"}
SMOKE_TEST_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ]
)
_CACHED_MODEL_DATA: dict[str, Any] | None = None
_S3_CLIENT = boto3.client("s3")


ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT",
}


def build_response(status_code: int, body: dict[str, Any]):
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }


class VelocityNetworkV1(nn.Module):
    def __init__(self, backbone: nn.Module):
        super().__init__()

        self.backbone = nn.Sequential(*list(backbone.children())[:-1])

        fc_in_features = backbone.fc.in_features
        if fc_in_features != 2048:
            raise ValueError(
                "Unexpected ResNet50 backbone output size. "
                f"Expected 2048, got {fc_in_features}."
            )

        self.embedding_head = nn.Sequential(
            nn.Linear(fc_in_features, 512),
            nn.BatchNorm1d(512),
            nn.GELU(),
            nn.Dropout(0.3),
        )

        self.regression_head = nn.Sequential(
            nn.Linear(512, 128),
            nn.BatchNorm1d(128),
            nn.GELU(),
            nn.Dropout(0.2),
            nn.Linear(128, 1),
        )

    def get_embedding(self, x: torch.Tensor) -> torch.Tensor:
        features = self.backbone(x)
        features = torch.flatten(features, 1)
        embedding = self.embedding_head(features)
        return F.normalize(embedding, p=2, dim=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        embedding = self.get_embedding(x)
        return self.regression_head(embedding)


def build_velocity_network_v1() -> VelocityNetworkV1:
    backbone = resnet50(weights=None)
    return VelocityNetworkV1(backbone)


def build_model_weights_s3_key(
    filename: str = DEFAULT_WEIGHTS_FILENAME,
    prefix: str = DEFAULT_S3_MODEL_PREFIX,
) -> str:
    normalized_prefix = prefix.strip("/")
    normalized_filename = filename.lstrip("/")

    if not normalized_prefix:
        return normalized_filename

    return f"{normalized_prefix}/{normalized_filename}"


def build_s3_uri(bucket: str, key: str) -> str:
    return f"s3://{bucket}/{key}"


def is_s3_not_found_error(error: ClientError) -> bool:
    error_code = error.response.get("Error", {}).get("Code")
    return error_code in {"404", "NoSuchKey", "NotFound"}


def parse_s3_url(s3_url: str) -> tuple[str, str]:
    parsed_url = urlparse(s3_url)
    bucket = ""
    key = ""

    if parsed_url.scheme == "s3":
        bucket = parsed_url.netloc
        key = parsed_url.path.lstrip("/")
    elif parsed_url.scheme in {"http", "https"}:
        host_parts = parsed_url.netloc.split(".")
        normalized_path = parsed_url.path.lstrip("/")

        if host_parts and host_parts[0] == "s3":
            bucket, _, key = normalized_path.partition("/")
        elif len(host_parts) >= 3 and host_parts[1] == "s3":
            bucket = host_parts[0]
            key = normalized_path

    if not bucket or not key:
        raise ValueError("ImageURL must be a valid S3 URL.")

    return bucket, key


def s3_object_exists(bucket: str, key: str) -> bool:
    try:
        _S3_CLIENT.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as error:
        if is_s3_not_found_error(error):
            return False
        raise


def upload_file_to_s3(local_path: str | Path, bucket: str, key: str) -> str:
    _S3_CLIENT.upload_file(str(local_path), bucket, key)
    s3_uri = build_s3_uri(bucket, key)
    print(f"File successfully uploaded to: {s3_uri}")
    return s3_uri


def ensure_model_weights_in_s3(
    repo_id: str = DEFAULT_REPO_ID,
    filename: str = DEFAULT_WEIGHTS_FILENAME,
    s3_bucket: str = DEFAULT_S3_BUCKET,
    s3_prefix: str = DEFAULT_S3_MODEL_PREFIX,
) -> str:
    weights_s3_key = build_model_weights_s3_key(filename=filename, prefix=s3_prefix)

    if not s3_object_exists(s3_bucket, weights_s3_key):
        raise FileNotFoundError(
            "Failed to obtain model's weights (.pth) from S3 and HuggingFace"
        )

    return build_s3_uri(s3_bucket, weights_s3_key)


def download_weights_from_s3(
    s3_uri: str,
    local_path: str | Path | None = None,
) -> str:
    bucket, key = parse_s3_url(s3_uri)

    if local_path is None:
        local_path = DEFAULT_TMP_MODEL_DIR / Path(key).name

    Path(local_path).parent.mkdir(parents=True, exist_ok=True)
    _S3_CLIENT.download_file(bucket, key, str(local_path))
    print(f"Model weights downloaded from S3 to: {local_path}")
    return str(local_path)


def build_model():
    return build_velocity_network_v1()


def load_model_description_markdown(markdown_path: str | Path):
    if not os.path.exists(markdown_path):
        print(f"Model description file not found at: {markdown_path}")
        return None

    with open(markdown_path, "r", encoding="utf-8") as markdown_file:
        model_description = markdown_file.read()

    print(f"Model description successfully loaded from: {markdown_path}")
    return model_description


def load_model_architecture_from_json(json_path: str | Path):
    if not os.path.exists(json_path):
        print(f"Model architecture file not found at: {json_path}")
        return None

    with open(json_path, "r", encoding="utf-8") as json_file:
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


def run_inference_from_pil_image(
    model: nn.Module,
    image: Image.Image,
    device: str = DEFAULT_DEVICE,
) -> float:
    transformed_image = SMOKE_TEST_TRANSFORM(image).unsqueeze(0).to(device)

    with torch.inference_mode():
        prediction = model(transformed_image)

    return float(prediction.reshape(-1)[0].item())


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


def run_smoke_test(model, device: str = DEFAULT_DEVICE):
    image_path = get_smoke_test_image_path()
    image = Image.open(image_path).convert("RGB")
    prediction_value = run_inference_from_pil_image(model, image, device=device)

    print(
        "Smoke test completed. "
        f"Image path: {image_path} | "
        f"Prediction value: {prediction_value}"
    )
    return prediction_value


def download_image_from_s3(image_url: str) -> Image.Image:
    image_bucket, image_key = parse_s3_url(image_url)

    try:
        response = _S3_CLIENT.get_object(Bucket=image_bucket, Key=image_key)
    except ClientError as error:
        if is_s3_not_found_error(error):
            raise FileNotFoundError("Imagen no encontrada en S3") from error
        raise

    image_bytes = response["Body"].read()
    response["Body"].close()
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def delete_image_from_s3(image_url: str) -> None:
    image_bucket, image_key = parse_s3_url(image_url)
    _S3_CLIENT.delete_object(Bucket=image_bucket, Key=image_key)


def extract_image_url_from_event(event: dict[str, Any] | None) -> str:
    if not isinstance(event, dict):
        raise ValueError("ImageURL parameter is required")

    direct_image_url = event.get(DEFAULT_IMAGE_URL_EVENT_KEY)
    

    if direct_image_url:
        return direct_image_url


    for parameter_key in ("queryStringParameters", "pathParameters"):
        parameter_group = event.get(parameter_key)
        if isinstance(parameter_group, dict):
            image_url = parameter_group.get(DEFAULT_IMAGE_URL_EVENT_KEY)
            if image_url:
                return image_url

    request_body = event.get("body")
    if isinstance(request_body, str):
        try:
            request_body = json.loads(request_body)
        except json.JSONDecodeError as error:
            raise ValueError("ImageURL parameter is required") from error

    if isinstance(request_body, dict):
        image_url = request_body.get(DEFAULT_IMAGE_URL_EVENT_KEY)
        if image_url:
            return image_url

    raise ValueError("ImageURL parameter is required")


def build_model_data_from_s3(
    weights_s3_uri: str,
    device: str = DEFAULT_DEVICE,
    run_smoke_test_after_load: bool = False,
):
    weights_path = download_weights_from_s3(weights_s3_uri)
    model = build_model()
    model = load_weights_into_model(model, weights_path, device=device)

    if run_smoke_test_after_load:
        run_smoke_test(model, device=device)

    return {
        "model": model,
        "weights_path": weights_path,
        "weights_s3_uri": weights_s3_uri,
        "device": device,
    }


def start_deployment_preparations(
    device: str = DEFAULT_DEVICE,
    run_smoke_test_after_load: bool = False,
):
    weights_s3_uri = ensure_model_weights_in_s3(
        repo_id=DEFAULT_REPO_ID,
        filename=DEFAULT_WEIGHTS_FILENAME,
        s3_bucket=DEFAULT_S3_BUCKET,
        s3_prefix=DEFAULT_S3_MODEL_PREFIX,
    )
    return build_model_data_from_s3(
        weights_s3_uri,
        device=device,
        run_smoke_test_after_load=run_smoke_test_after_load,
    )


def get_or_create_model_data(device: str = DEFAULT_DEVICE):
    global _CACHED_MODEL_DATA

    weights_s3_uri = ensure_model_weights_in_s3(
        repo_id=DEFAULT_REPO_ID,
        filename=DEFAULT_WEIGHTS_FILENAME,
        s3_bucket=DEFAULT_S3_BUCKET,
        s3_prefix=DEFAULT_S3_MODEL_PREFIX,
    )

    if _CACHED_MODEL_DATA is None or _CACHED_MODEL_DATA.get("device") != device:
        _CACHED_MODEL_DATA = build_model_data_from_s3(weights_s3_uri, device=device)
    else:
        _CACHED_MODEL_DATA["weights_s3_uri"] = weights_s3_uri

    return _CACHED_MODEL_DATA


def lambda_handler(event, context):
    print("Received event:", json.dumps(event))

    try:
        # CORS preflight request from browser
        if isinstance(event, dict):
            request_method = (
                event.get("requestContext", {})
                .get("http", {})
                .get("method")
            ) or event.get("httpMethod")

            if request_method == "OPTIONS":
                return {
                    "statusCode": 200,
                    "headers": CORS_HEADERS,
                    "body": json.dumps({"message": "CORS preflight OK"}),
                }

        # Simple Lambda/API test
        if isinstance(event, dict) and event.get("test") == "test":
            return build_response(200, {"message": "OK"})

        model_data = get_or_create_model_data(device=DEFAULT_DEVICE)
        image_url = extract_image_url_from_event(event)
        image = download_image_from_s3(image_url)

        velocity_kph = run_inference_from_pil_image(
            model_data["model"],
            image,
            device=model_data["device"],
        )

        if "AIVELTEST" not in image_url.split("/")[-1]:
            delete_image_from_s3(image_url)

        return build_response(200, {
            "velocity_kph": velocity_kph
        })

    except (FileNotFoundError, ValueError) as error:
        return build_response(400, {
            "error": str(error)
        })

    except RuntimeError as error:
        return build_response(500, {
            "error": str(error)
        })

    except Exception as error:
        return build_response(500, {
            "error": str(error)
        })