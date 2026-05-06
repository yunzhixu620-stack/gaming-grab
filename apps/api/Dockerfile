# API Dockerfile — lightweight Python image
FROM python:3.12-slim

WORKDIR /app

# Install dependencies (minimal)
COPY pyproject.toml .
RUN pip install --no-cache-dir fastapi uvicorn httpx beautifulsoup4 pydantic

# Copy source
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
