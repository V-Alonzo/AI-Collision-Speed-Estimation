from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from huggingface_hub import HfApi

PROJECT_ROOT = Path(__file__).resolve().parent
ENV_FILE = PROJECT_ROOT / ".env"
IMAGES_DIR = PROJECT_ROOT / "utils" / "Preprocessing" / "NHTSADatabaseExtraction" / "Extraction" / "Images" / "CIREN"
PARQUETS_DIR = PROJECT_ROOT / "utils" / "Preprocessing" / "NHTSADatabaseExtraction" / "Extraction" / "Parquets" / "CIREN"
MODELS_DIR = PROJECT_ROOT / "utils" / "Preprocessing" / "ImagesExtractionClassification" / "models"

DEFAULT_IMAGES_PATH_IN_REPO = "images/CIREN"
DEFAULT_PARQUETS_PATH_IN_REPO = "parquets/CIREN"
DEFAULT_MODELS_PATH_IN_REPO = ""
DEFAULT_IGNORE_PATTERNS = [
    "**/__pycache__/**",
    "**/.ipynb_checkpoints/**",
    ".gitkeep",
]

load_dotenv(dotenv_path=ENV_FILE)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Sube a Hugging Face las imágenes CIREN, los parquets CIREN y los modelos "
            "almacenados en este repositorio."
        )
    )
    parser.add_argument(
        "--dataset-repo-id",
        default=os.getenv("HF_DATASET_REPO_ID"),
        help="Repositorio destino de tipo dataset para imágenes y parquets.",
    )
    parser.add_argument(
        "--model-repo-id",
        default=os.getenv("HF_MODEL_REPO_ID"),
        help="Repositorio destino de tipo model para los pesos y artefactos del directorio models.",
    )
    parser.add_argument(
        "--token",
        default=os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_HUB_TOKEN"),
        help="Token de Hugging Face. Si se omite, se toma de HF_TOKEN o HUGGINGFACE_HUB_TOKEN.",
    )
    parser.add_argument(
        "--images-path-in-repo",
        default=os.getenv("HF_IMAGES_PATH_IN_REPO", DEFAULT_IMAGES_PATH_IN_REPO),
        help="Ruta destino dentro del repo dataset para las imágenes CIREN.",
    )
    parser.add_argument(
        "--parquets-path-in-repo",
        default=os.getenv("HF_PARQUETS_PATH_IN_REPO", DEFAULT_PARQUETS_PATH_IN_REPO),
        help="Ruta destino dentro del repo dataset para los parquets CIREN.",
    )
    parser.add_argument(
        "--models-path-in-repo",
        default=os.getenv("HF_MODELS_PATH_IN_REPO", DEFAULT_MODELS_PATH_IN_REPO),
        help="Ruta destino dentro del repo model para los archivos del directorio models.",
    )
    parser.add_argument(
        "--dataset-private",
        action="store_true",
        help="Si el repo dataset no existe, lo crea como privado.",
    )
    parser.add_argument(
        "--model-private",
        action="store_true",
        help="Si el repo model no existe, lo crea como privado.",
    )
    parser.add_argument(
        "--skip-images",
        action="store_true",
        help="Omite la subida de las imágenes CIREN.",
    )
    parser.add_argument(
        "--skip-parquets",
        action="store_true",
        help="Omite la subida de los parquets CIREN.",
    )
    parser.add_argument(
        "--skip-models",
        action="store_true",
        help="Omite la subida de los modelos.",
    )
    return parser.parse_args()


def require_existing_directory(path: Path, label: str) -> None:
    if not path.exists():
        raise FileNotFoundError(f"No existe el directorio de {label}: {path}")
    if not path.is_dir():
        raise NotADirectoryError(f"La ruta de {label} no es un directorio: {path}")


def normalize_repo_path(path_in_repo: str) -> Optional[str]:
    normalized = path_in_repo.replace("\\", "/").strip("/").strip()
    return normalized or None


def ensure_repo_requirements(args: argparse.Namespace) -> None:
    if not args.token:
        raise ValueError(
            "Debes proporcionar un token mediante --token o las variables HF_TOKEN / HUGGINGFACE_HUB_TOKEN."
        )

    dataset_upload_requested = not args.skip_images or not args.skip_parquets
    if dataset_upload_requested and not args.dataset_repo_id:
        raise ValueError(
            "Debes indicar --dataset-repo-id (o definir HF_DATASET_REPO_ID) para subir imágenes y/o parquets."
        )

    if not args.skip_models and not args.model_repo_id:
        raise ValueError(
            "Debes indicar --model-repo-id (o definir HF_MODEL_REPO_ID) para subir el directorio de modelos."
        )


def ensure_target_repositories(api: HfApi, args: argparse.Namespace) -> None:
    if not args.skip_images or not args.skip_parquets:
        api.create_repo(
            repo_id=args.dataset_repo_id,
            repo_type="dataset",
            private=args.dataset_private,
            exist_ok=True,
        )

    if not args.skip_models:
        api.create_repo(
            repo_id=args.model_repo_id,
            repo_type="model",
            private=args.model_private,
            exist_ok=True,
        )


def upload_directory(
    api: HfApi,
    *,
    local_dir: Path,
    repo_id: str,
    repo_type: str,
    path_in_repo: str,
    commit_message: str,
) -> None:
    
    require_existing_directory(local_dir, label=local_dir.name)

    api.upload_folder(
        repo_id=repo_id,
        repo_type=repo_type,
        folder_path=str(local_dir),
        path_in_repo=normalize_repo_path(path_in_repo),
        commit_message=commit_message,
        ignore_patterns=DEFAULT_IGNORE_PATTERNS,
    )


def repo_url(repo_id: str, repo_type: str) -> str:
    if repo_type == "dataset":
        return f"https://huggingface.co/datasets/{repo_id}"
    return f"https://huggingface.co/{repo_id}"


def main() -> int:
    args = parse_args()
    ensure_repo_requirements(args)

    api = HfApi(token=args.token)
    ensure_target_repositories(api, args)

    completed_uploads: list[str] = []

    if not args.skip_images:
        print(f"Subiendo imágenes desde: {IMAGES_DIR}")
        upload_directory(
            api,
            local_dir=IMAGES_DIR,
            repo_id=args.dataset_repo_id,
            repo_type="dataset",
            path_in_repo=args.images_path_in_repo,
            commit_message="Upload CIREN images",
        )
        completed_uploads.append(
            f"- Imágenes CIREN -> {repo_url(args.dataset_repo_id, 'dataset')}/{normalize_repo_path(args.images_path_in_repo) or ''}"
        )

    if not args.skip_parquets:
        print(f"Subiendo parquets desde: {PARQUETS_DIR}")
        upload_directory(
            api,
            local_dir=PARQUETS_DIR,
            repo_id=args.dataset_repo_id,
            repo_type="dataset",
            path_in_repo=args.parquets_path_in_repo,
            commit_message="Upload CIREN parquet files",
        )
        completed_uploads.append(
            f"- Parquets CIREN -> {repo_url(args.dataset_repo_id, 'dataset')}/{normalize_repo_path(args.parquets_path_in_repo) or ''}"
        )

    if not args.skip_models:
        print(f"Subiendo modelos desde: {MODELS_DIR}")
        upload_directory(
            api,
            local_dir=MODELS_DIR,
            repo_id=args.model_repo_id,
            repo_type="model",
            path_in_repo=args.models_path_in_repo,
            commit_message="Upload local models",
        )
        model_destination = normalize_repo_path(args.models_path_in_repo)
        suffix = f"/{model_destination}" if model_destination else ""
        completed_uploads.append(
            f"- Modelos -> {repo_url(args.model_repo_id, 'model')}{suffix}"
        )

    if not completed_uploads:
        print("No se solicitó ninguna subida. Revisa las banderas --skip-*.")
        return 0

    print("\nSubidas completadas:")
    for upload_summary in completed_uploads:
        print(upload_summary)

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc