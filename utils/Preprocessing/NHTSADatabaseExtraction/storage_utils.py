"""Shared storage and filesystem helpers for NHTSA/CIREN extraction."""

import json
import os
import re
from typing import Any, Dict


def delete_file_if_exists(file_path: str) -> None:
    """Delete a file if it exists, ignoring missing-path cases."""

    if os.path.exists(file_path):
        os.remove(file_path)


def sanitize_metadata_for_filename(value: Any, fallback: str = "Unknown") -> str:
    """Normalize metadata so it can be safely embedded in filenames."""

    if value is None:
        return fallback

    normalized = str(value).strip()
    if not normalized:
        return fallback

    normalized = normalized.replace("/", "-")
    normalized = normalized.replace("\\", "-")
    normalized = normalized.replace("`", "")
    normalized = re.sub(r"\s+", "-", normalized)
    normalized = re.sub(r"[^A-Za-z0-9._-]", "", normalized)
    normalized = re.sub(r"-+", "-", normalized).strip("-._")

    return normalized or fallback


def read_cached_results(cache_path: str | None) -> Dict[str, Dict[str, Any]]:
    """Read a JSON cache file if it exists, otherwise return an empty mapping."""

    if cache_path and os.path.isfile(cache_path):
        with open(cache_path, "r") as cache_file:
            payload = json.load(cache_file)
            if isinstance(payload, dict):
                return payload
    return {}


def write_cached_results(cache_path: str | None, payload: Dict[str, Dict[str, Any]]) -> None:
    """Persist cache payloads used by resumable NHTSA and CIREN extraction runs."""

    if not cache_path:
        return

    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    with open(cache_path, "w") as cache_file:
        json.dump(payload, cache_file, indent=4)


def remove_dir_if_empty(dir_path: str | None) -> None:
    """Remove a directory only when the current run left it empty."""

    if dir_path and os.path.isdir(dir_path) and not os.listdir(dir_path):
        os.rmdir(dir_path)


def save_binary_file(file_bytes: bytes, output_path: str) -> None:
    """Persist binary content to disk, creating parent directories when needed."""

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as output_file:
        output_file.write(file_bytes)