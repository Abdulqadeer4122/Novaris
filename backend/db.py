"""
Application-level DB bootstrap.

- SQLAlchemy engine + tables  →  managed by Alembic migrations (run separately)
- LangGraph PostgresSaver     →  uses psycopg_pool directly; calls .setup() once
                                 at startup to create its own checkpoint tables.
"""
import logging

from psycopg_pool import ConnectionPool
from langgraph.checkpoint.postgres import PostgresSaver

from config import settings
import database
import models  # noqa: F401 — ensures all ORM models are registered on Base.metadata

log = logging.getLogger("assistant.db")

_pool: ConnectionPool | None = None


def get_pool() -> ConnectionPool:
    assert _pool is not None, "DB not initialized — call init_db() first"
    return _pool


def init_db() -> PostgresSaver:
    """
    1. Initialise the SQLAlchemy engine (used by ORM models / Alembic).
    2. Open a psycopg connection pool for LangGraph's PostgresSaver.
    3. Call checkpointer.setup() to create LangGraph's checkpoint tables.

    Returns the PostgresSaver checkpointer to pass to build_supervisor().

    NOTE: Alembic migrations must be run separately before starting the server:
        alembic upgrade head
    """
    global _pool

    # 1. SQLAlchemy engine + create app tables
    # create_all is a no-op for tables that already exist, so it is safe on every startup.
    # For production schema changes use: alembic revision --autogenerate && alembic upgrade head
    database.init_engine()
    database.Base.metadata.create_all(database.engine)

    # 2. psycopg pool for LangGraph (accepts plain postgresql:// URLs)
    # autocommit=True is required — PostgresSaver.setup() runs CREATE INDEX CONCURRENTLY
    # which cannot execute inside a transaction block.
    log.info("Opening psycopg connection pool for LangGraph…")
    _pool = ConnectionPool(
        conninfo=settings.postgres_url,
        max_size=10,
        open=True,
        kwargs={"autocommit": True, "prepare_threshold": 0},
    )

    # 3. LangGraph checkpoint tables
    checkpointer = PostgresSaver(_pool)
    checkpointer.setup()
    log.info("LangGraph PostgresSaver ready ✅")

    return checkpointer


def close_db() -> None:
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None
        log.info("psycopg connection pool closed")
