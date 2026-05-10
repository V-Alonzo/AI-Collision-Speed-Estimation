import os
from collections import defaultdict
from functools import lru_cache

import cv2
import torch
from matplotlib import pyplot as plt
from PIL import Image
from ultralytics import YOLO

from PATHS import (
    CARS_YOLO_MODEL_PATH as carsYoloModelPath,
    PIECES_YOLO_MODEL_PATH as piecesYoloModelPath,
    DAMAGES_YOLO_MODEL_PATH as damagesYoloModelPath,
)
from configurations import (
    CARS_CLASSES as carsClasses,
    PIECES_CLASSES as piecesClasses,
    DAMAGES_CLASSES as damagesClasses,
    YOLO_CONFIDENCE_THRESHOLD as YOLO_CONFIDENCE_THRESHOLD,
)

from inference_sdk import InferenceHTTPClient
from configurations import MINIMUM_BOX_AREA_THRESHOLD

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

carsModel = YOLO(carsYoloModelPath)
piecesModel = YOLO(piecesYoloModelPath)
damagesModel = YOLO(damagesYoloModelPath)

_DAMAGE_VLM_MODEL_ID = "Qwen/Qwen2-VL-2B-Instruct"
_DAMAGE_VLM_DEVICE = "mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu"
_DAMAGE_VLM_DTYPE = torch.float16 if _DAMAGE_VLM_DEVICE in {"mps", "cuda"} else torch.float32
_DAMAGE_VLM_MAX_IMAGE_SIDE = 768
_DAMAGE_VLM_MESSAGES = [
    {
        "role": "user",
        "content": [
            {"type": "image"},
            {"type": "text", "text": """

Analyze this image of a vehicle.

Determine whether the vehicle shows visible collision damage.

Criteria:
- deformation
- crushed panels
- broken structure
- visible impact damage
- detached parts
- bent geometry

Ignore:
- reflections
- dirt
- shadows
- perspective distortions
- Objects attached to the vehicle that are not part of it (e.g., roof racks, bike racks, cargo boxes, cameras, sensors, etc.)

Respond strictly ONLY with:
DAMAGED
or
NORMAL

"""},
        ],
    },
]


def _resize_damage_image(pil_image, max_side=_DAMAGE_VLM_MAX_IMAGE_SIDE):
    width, height = pil_image.size
    largest_side = max(width, height)

    if largest_side <= max_side:
        return pil_image

    scale = max_side / largest_side
    resized_dimensions = (max(1, int(width * scale)), max(1, int(height * scale)))
    return pil_image.resize(resized_dimensions, Image.Resampling.LANCZOS)


@lru_cache(maxsize=1)
def _get_damage_vlm_components():
    from transformers import AutoProcessor, Qwen2VLForConditionalGeneration

    processor = AutoProcessor.from_pretrained(_DAMAGE_VLM_MODEL_ID)
    model = Qwen2VLForConditionalGeneration.from_pretrained(
        _DAMAGE_VLM_MODEL_ID,
        torch_dtype=_DAMAGE_VLM_DTYPE,
        low_cpu_mem_usage=True,
    )
    model = model.to(_DAMAGE_VLM_DEVICE)
    model.eval()
    prompt_text = processor.apply_chat_template(
        _DAMAGE_VLM_MESSAGES,
        add_generation_prompt=True,
        tokenize=False,
    )
    return processor, model, prompt_text


def classify_with_model(image, model, classes=None, draw_outputs=False, applyMinimumBoxAreaThreshold=True, confidence_threshold=YOLO_CONFIDENCE_THRESHOLD):
    class_list = model.names    
    class_counts = defaultdict(int)

    results = model.predict(image, classes=classes, verbose=True, conf=confidence_threshold)

    areaImagePixels = image.shape[0] * image.shape[1]
    reallySmallBoxes = 0
    boxes = []

    has_detections = False

    if results[0].boxes is not None and len(results[0].boxes) > 0:
        boxes = results[0].boxes.xyxy.cpu()
        class_indices = results[0].boxes.cls.int().cpu().tolist()

        for box, class_index in zip(boxes, class_indices):
            boxArea = (box[2] - box[0]) * (box[3] - box[1])

            if applyMinimumBoxAreaThreshold and boxArea / areaImagePixels < MINIMUM_BOX_AREA_THRESHOLD:
                reallySmallBoxes += 1
                continue

            x1, y1, x2, y2 = map(int, box)
            class_name = class_list[class_index]
            class_counts[class_name] += 1

            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2

            if draw_outputs:
                cv2.circle(image, (center_x, center_y), 4, (0, 0, 255), -1)
                cv2.putText(
                    image,
                    f"{class_name} :{boxArea / areaImagePixels:.2f}",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 0, 0),
                    2,
                )
                cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

        has_detections = reallySmallBoxes < len(results[0].boxes) if results[0].boxes is not None else False
    
    else:
        if results[0].masks is not None and len(results[0].masks) > 0:
            has_detections = True
            for segment in results:
                image = segment.plot()

    return image, has_detections, boxes


def classify_cars_image(image, draw_outputs=False, applyMinimumBoxAreaThreshold=True):
    return classify_with_model(image, carsModel, carsClasses, draw_outputs=draw_outputs, applyMinimumBoxAreaThreshold=applyMinimumBoxAreaThreshold)


def classify_pieces_image(image, draw_outputs=False, applyMinimumBoxAreaThreshold=True):
    return classify_with_model(image, piecesModel, piecesClasses, draw_outputs=draw_outputs, applyMinimumBoxAreaThreshold=applyMinimumBoxAreaThreshold)

def classify_damages_image(image, draw_outputs=False, applyMinimumBoxAreaThreshold=False, dent_threshold=0.7):

    pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    pil_image = _resize_damage_image(pil_image)

    processor, model, prompt_text = _get_damage_vlm_components()

    inputs = processor(
        text=[prompt_text],
        images=[pil_image],
        padding=False,
        return_tensors="pt",
    ).to(_DAMAGE_VLM_DEVICE)

    with torch.inference_mode():
        outputs = model.generate(
            **inputs,
            max_new_tokens=4,
            do_sample=False,
            use_cache=True,
        )
    generated_ids = [
        output_ids[len(input_ids):]
        for input_ids, output_ids in zip(inputs.input_ids, outputs)
    ]

    response = processor.batch_decode(
        generated_ids,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=False,
    )[0].strip()

    return "DAMAGED" in response.upper()
