import os

from app.core.logging import configure_logging
from app.core.tracing import configure_langsmith

# Must run BEFORE any `from langchain_*` imports (routes → workflow → langchain).
configure_logging()
configure_langsmith()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.config import get_settings
from app.services.audit import init_db

settings = get_settings()
init_db()


app = FastAPI(title=settings.app_name, version="1.0.0")

allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed_origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "service": settings.app_name,
        "docs": "/docs",
        "health": "/api/health",
        "langsmith": settings.langsmith_tracing,
    }
