FROM public.ecr.aws/lambda/python:3.12

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR ${LAMBDA_TASK_ROOT}

RUN dnf install -y libgomp && dnf clean all

RUN python -m pip install --upgrade pip setuptools wheel

RUN python -m pip install --only-binary=:all: \
    "numpy==2.4.6" \
    "scipy==1.17.1" \
    "scikit-learn==1.8.0" \
    "pandas==3.0.3" \
    "pillow" \
    "boto3"

RUN python -m pip install \
    "torch==2.6.0+cpu" \
    "torchvision==0.21.0+cpu" \
    --extra-index-url https://download.pytorch.org/whl/cpu

COPY orchestator.py .
COPY preprocessing_pipeline.pkl .

CMD ["orchestator.lambda_handler"]