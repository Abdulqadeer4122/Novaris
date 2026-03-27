import logging
from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from config import settings

log = logging.getLogger("assistant.database")

# ---------------------------------------------------------------------------
# Base class — all models inherit from this
# ---------------------------------------------------------------------------

class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Engine + session factory — populated by init_engine() at startup
# ---------------------------------------------------------------------------

engine = None
SessionLocal: sessionmaker | None = None


def _sqlalchemy_url(raw_url: str) -> str:
    """
    Normalise a plain postgres(ql):// URL to the psycopg2 dialect expected
    by SQLAlchemy.  LangGraph's PostgresSaver uses the raw URL separately.
    """
    url = raw_url
    if url.startswith("postgres://"):
        url = "postgresql+psycopg2://" + url[len("postgres://"):]
    elif url.startswith("postgresql://"):
        url = "postgresql+psycopg2://" + url[len("postgresql://"):]
    return url


def init_engine() -> None:
    global engine, SessionLocal
    url = _sqlalchemy_url(settings.postgres_url)
    log.info("Creating SQLAlchemy engine…")
    engine = create_engine(url, pool_size=10, max_overflow=5, future=True)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    log.info("SQLAlchemy engine ready ✅")


@contextmanager
def db_session() -> Generator[Session, None, None]:
    """
    Context manager for use **outside** FastAPI request context:

        with db_session() as db:
            db.query(...)
    """
    assert SessionLocal is not None, "Call init_engine() before db_session()"
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency — plain generator so Depends() can iterate it:

        async def endpoint(db: Session = Depends(get_db)): ...
    """
    with db_session() as db:
        yield db
