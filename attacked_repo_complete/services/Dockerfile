FROM python:3.11-slim

# Avoid interactive prompts during package installs
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Copy requirements first (for caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY configs ./configs
COPY services ./services
COPY scripts ./scripts
COPY sample_data ./sample_data

# Ensure Python can import from /app/services
ENV PYTHONPATH=/app/services

# Switch between worker and api depending on APP_ROLE
CMD ["bash", "-lc", "if [ \"$APP_ROLE\" = \"worker\" ]; then celery -A api.celery_app.celery_app worker -l info; else uvicorn api.app:app --host 0.0.0.0 --port 8000; fi"]
