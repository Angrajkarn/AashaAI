# Use official Python 3.11 slim image
FROM public.ecr.aws/docker/library/python:3.11-slim

# Set working directory to project root
WORKDIR /app

# Install system dependencies required for psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy production requirements (lean - no torch/chromadb, AI via AWS Bedrock)
COPY backend/requirements.prod.txt ./backend/

# Cache bust arg — increment to force fresh pip install
ARG CACHEBUST=4
# Install Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.prod.txt

# Copy backend source code including local SQLite fallbacks and models
COPY backend/ ./backend/

# Create the uploads directory for multimodal images to prevent permission issues
RUN mkdir -p /app/backend/uploads

EXPOSE 8000

# We run main:app inside the backend module structure
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
