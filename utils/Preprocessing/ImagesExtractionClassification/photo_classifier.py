import cv2
import numpy as np
import open_clip
import torch
from PIL import Image

from configurations import PHOTO_TEXT_LABELS
from configurations import IS_PHOTOGRAPH_PROBABILITY_THRESHOLD


clipPhotoContext = None


def get_photo_clip_context():
    global clipPhotoContext

    if clipPhotoContext is not None:
        return clipPhotoContext

    device = "mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu"

    model, _, preprocess = open_clip.create_model_and_transforms(
        "ViT-B-32",
        pretrained="laion2b_s34b_b79k",
    )
    model = model.to(device)
    tokenizer = open_clip.get_tokenizer("ViT-B-32")
    text_tokens = tokenizer(PHOTO_TEXT_LABELS).to(device)

    clipPhotoContext = {
        "torch": torch,
        "model": model,
        "preprocess": preprocess,
        "text_tokens": text_tokens,
        "device": device,
        "image_class": Image,
    }
    return clipPhotoContext


def clip_score(image_path, clip_context):
    torch_module = clip_context["torch"]
    model = clip_context["model"]
    preprocess = clip_context["preprocess"]
    text_tokens = clip_context["text_tokens"]
    device = clip_context["device"]
    image_class = clip_context["image_class"]

    image_tensor = preprocess(image_class.open(image_path).convert("RGB")).unsqueeze(0).to(device)

    with torch_module.no_grad():
        image_features = model.encode_image(image_tensor)
        text_features = model.encode_text(text_tokens)

        image_features /= image_features.norm(dim=-1, keepdim=True)
        text_features /= text_features.norm(dim=-1, keepdim=True)

        logits = (image_features @ text_features.T) * 100
        probabilities = logits.softmax(dim=-1).cpu().numpy()[0]

    return probabilities


def noise_score(image_path):
    grayscale_image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    if grayscale_image is None:
        return 0.0

    blurred_image = cv2.GaussianBlur(grayscale_image, (3, 3), 0)
    noise = grayscale_image - blurred_image
    noise_std = np.std(noise)

    return min(noise_std / 20.0, 1.0)


def is_photograph(image_path, clip_context):
    probabilities = clip_score(image_path, clip_context)
    noise = noise_score(image_path)

    photo_probability = probabilities[0]
    non_photo_probability = sum(probabilities[1:])

    total = photo_probability + non_photo_probability

    if total == 0:
        photo_probability = 0.0
        non_photo_probability = 1.0
    else:
        photo_probability /= total
        non_photo_probability /= total

    final_score = 0.7 * photo_probability + 0.3 * noise

    return {
        "isPhoto": bool(final_score > IS_PHOTOGRAPH_PROBABILITY_THRESHOLD),
        "confidence": float(final_score),
        "clipPhotoScore": float(photo_probability),
        "clipNonPhotoScore": float(non_photo_probability),
        "noiseScore": float(noise),
    }
