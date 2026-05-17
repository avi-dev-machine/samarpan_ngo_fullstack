FROM python:3.11-slim

# Set timezone and disable buffering
ENV PYTHONUNBUFFERED=1
ENV TZ=UTC

WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Pre-install pip requirements for maximum cache speed
COPY requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy source code
COPY . /code

# Create uploads and data directories with full read/write access
RUN mkdir -p /code/uploads && chmod -R 777 /code/uploads

# Expose port 7860 (Hugging Face Spaces default port)
EXPOSE 7860

# Run FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
