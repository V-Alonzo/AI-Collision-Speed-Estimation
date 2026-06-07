FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/app/.cache/huggingface

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip setuptools wheel

RUN pip install \
    annotated-doc==0.0.4 \
    anyio==4.13.0 \
    brotli==1.2.0 \
    certifi==2026.5.20 \
    charset-normalizer==3.4.7 \
    colorama==0.4.6 \
    exceptiongroup==1.3.1 \
    filelock==3.29.1 \
    fsspec==2026.4.0 \
    h11==0.16.0 \
    h2==4.3.0 \
    hf-xet==1.2.0 \
    hpack==4.1.0 \
    httpcore==1.0.9 \
    httpx==0.28.1 \
    huggingface_hub==1.4.1 \
    hyperframe==6.1.0 \
    idna==3.17 \
    jinja2==3.1.6 \
    markdown-it-py==4.2.0 \
    markupsafe==3.0.3 \
    mdurl==0.1.2 \
    mpmath==1.3.0 \
    networkx==3.6.1 \
    numpy==2.4.6 \
    opencv-python==4.13.0.92 \
    packaging==26.0 \
    pillow==12.2.0 \
    pygments==2.20.0 \
    pysocks==1.7.1 \
    pyyaml==6.0.3 \
    requests==2.34.2 \
    rich==15.0.0 \
    shellingham==1.5.4 \
    sniffio==1.3.1 \
    sympy==1.14.0 \
    tqdm==4.68.1 \
    typer==0.26.7 \
    typer-slim==0.24.0 \
    typing-extensions==4.15.0 \
    urllib3==2.2.1

RUN pip install --extra-index-url https://download.pytorch.org/whl/cpu \
    torch==2.12.0 \
    torchvision==0.27.0

COPY . .

CMD ["python", "-m", "model.src.ImageVelocityEstimator.Deployment.orchestator"]