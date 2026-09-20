"""LangSmith tracing bootstrap.

LangChain reads env vars at import time, so this must run BEFORE any
`from langchain_*` imports happen elsewhere in the app.
"""

import logging
import os

logger = logging.getLogger(__name__)


def configure_langsmith() -> None:
    from app.core.config import get_settings

    settings = get_settings()

    if not settings.langsmith_tracing:
        os.environ.pop("LANGCHAIN_TRACING_V2", None)
        os.environ.pop("LANGSMITH_TRACING", None)
        return

    if not settings.langsmith_api_key:
        logger.warning("LANGSMITH_TRACING is enabled but LANGSMITH_API_KEY is missing — tracing disabled.")
        return

    # LangChain historically reads LANGCHAIN_* env vars; newer SDKs also read LANGSMITH_*.
    # Set both to be safe.
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGSMITH_TRACING"] = "true"
    os.environ["LANGCHAIN_API_KEY"] = settings.langsmith_api_key
    os.environ["LANGSMITH_API_KEY"] = settings.langsmith_api_key
    os.environ["LANGCHAIN_PROJECT"] = settings.langsmith_project
    os.environ["LANGSMITH_PROJECT"] = settings.langsmith_project
    os.environ["LANGCHAIN_ENDPOINT"] = settings.langsmith_endpoint
    os.environ["LANGSMITH_ENDPOINT"] = settings.langsmith_endpoint

    logger.info("LangSmith tracing enabled → project=%s", settings.langsmith_project)
