FROM public.ecr.aws/lambda/python:3.11

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR ${LAMBDA_TASK_ROOT}

RUN yum install -y libgomp && yum clean all

RUN python -m pip install --upgrade pip setuptools wheel

RUN python -m pip install "numpy<2.3" pillow boto3

RUN python -m pip install \
    torch==2.6.0+cpu \
    torchvision==0.21.0+cpu \
    --extra-index-url https://download.pytorch.org/whl/cpu

COPY orchestator.py .

CMD ["orchestator.lambda_handler"]