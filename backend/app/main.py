import os
from pathlib import Path

from app.core.logging import configure_logging
from app.core.tracing import configure_langsmith

# Must run BEFORE any `from langchain_*` imports (routes → workflow → langchain).
configure_logging()
configure_langsmith()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from app.api.routes import router
from app.core.config import get_settings
from app.services.audit import init_db

settings = get_settings()
init_db()


app = FastAPI(title=settings.app_name, version="1.0.0")

# CORS — only relevant when frontend runs separately (local dev on :3000).
# In unified production deploy, frontend is same-origin so CORS is a no-op.
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


# Serve the Next.js static export (from /app/static in the container)
# Directory is created by the Dockerfile's frontend build stage.
STATIC_DIR = Path(os.getenv("FRONTEND_DIST", "/app/static"))


@app.get("/api/meta")
def meta():
    """Non-conflicting metadata endpoint for status checks / debugging."""
    return {
        "service": settings.app_name,
        "docs": "/docs",
        "health": "/api/health",
        "langsmith": settings.langsmith_tracing,
        "frontend_bundled": STATIC_DIR.exists(),
    }


if STATIC_DIR.exists():
    # Mount Next.js hashed assets under /_next
    next_assets = STATIC_DIR / "_next"
    if next_assets.exists():
        app.mount("/_next", StaticFiles(directory=str(next_assets)), name="next-assets")

    # Serve favicon, robots, images, etc. at the root
    @app.get("/favicon.ico", include_in_schema=False)
    def favicon():
        return FileResponse(STATIC_DIR / "favicon.ico")

    # Catch-all for the SPA — must be LAST route registered.
    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str, request: Request):
        # Never intercept API routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi"):
            return JSONResponse({"detail": "Not found"}, status_code=404)

        # Try direct file match (e.g. /file.svg, /some-path.html)
        candidate = STATIC_DIR / full_path
        if candidate.is_file():
            return FileResponse(candidate)

        # Fall through to index.html — SPA client-side router takes over
        return FileResponse(STATIC_DIR / "index.html")
else:
    # No frontend bundled (e.g. local dev with separate `npm run dev`).
    @app.get("/")
    def root():
        return {
            "service": settings.app_name,
            "docs": "/docs",
            "health": "/api/health",
            "note": "Frontend not bundled. Run `npm run dev` in ./frontend or build unified image.",
        }
