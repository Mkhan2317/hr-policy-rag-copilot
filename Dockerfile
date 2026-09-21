# syntax=docker/dockerfile:1

# ---------- Stage 1: Build the Next.js static site ----------
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1
# Same-origin in production — no NEXT_PUBLIC_API_URL needed (defaults to "")
RUN npm run build

# ---------- Stage 2: Python backend + bundled frontend ----------
FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8080 \
    FRONTEND_DIST=/app/static

WORKDIR /app

# System deps for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl \
    && rm -rf /var/lib/apt/lists/*

# Python deps (cached layer)
COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Backend code
COPY backend/app ./app
COPY backend/run.py backend/ingest_sample_kb.py ./
COPY backend/data/sample_kb ./data/sample_kb

# Frontend static output from builder stage
COPY --from=frontend-builder /build/out /app/static

# Runtime dirs
RUN mkdir -p /app/data /app/uploads

# Non-root user
RUN useradd --create-home --uid 1001 appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -fsS http://localhost:${PORT}/api/health || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
