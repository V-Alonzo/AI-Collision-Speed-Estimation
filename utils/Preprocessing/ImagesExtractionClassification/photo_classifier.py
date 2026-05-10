import cv2
import numpy as np
import open_clip
import torch
from PIL import Image

from configurations import PHOTO_TEXT_LABELS
from configurations import IS_PHOTOGRAPH_PROBABILITY_THRESHOLD


clipContexts = {}


def get_clip_context(text_labels, context_name, generateNewContext=False):
    global clipContexts

    if context_name in clipContexts and not generateNewContext:
        return clipContexts[context_name]

    device = "mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu"

    model, _, preprocess = open_clip.create_model_and_transforms(
        "ViT-B-32",
        pretrained="laion2b_s34b_b79k",
    )
    model = model.to(device)
    tokenizer = open_clip.get_tokenizer("ViT-B-32")
    text_tokens = tokenizer(text_labels).to(device)

    clip_context = {
        "torch": torch,
        "model": model,
        "preprocess": preprocess,
        "text_tokens": text_tokens,
        "device": device,
        "image_class": Image,
        "labels": text_labels,
    }

    clipContexts[context_name] = clip_context
    return clip_context


def get_photo_clip_context(photoTextLabels=PHOTO_TEXT_LABELS, generateNewContext=False):
    return get_clip_context(photoTextLabels, "photo", generateNewContext)



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



def is_photograph(image_path, clip_context, indexesIsPhotoProbabilities = [0], indexesNonPhotoProbabilities = [i for i in range(1, len(PHOTO_TEXT_LABELS))]):
    probabilities = clip_score(image_path, clip_context)

    photo_probability = sum(probabilities[i] for i in indexesIsPhotoProbabilities)
    non_photo_probability = sum(probabilities[i] for i in indexesNonPhotoProbabilities)

    total = photo_probability + non_photo_probability

    if total == 0:
        photo_probability = 0.0
        non_photo_probability = 1.0
    else:
        photo_probability /= total
        non_photo_probability /= total
    
    print(f"PROBABILITIES for '{image_path}': {probabilities}")

    final_score = photo_probability

    return {
        "isPhoto": bool(final_score > IS_PHOTOGRAPH_PROBABILITY_THRESHOLD),
        "confidence": float(final_score),
        "clipPhotoScore": float(photo_probability),
        "clipNonPhotoScore": float(non_photo_probability),
    }