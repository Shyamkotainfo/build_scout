import logging
from typing import Iterator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from config.settings import get_settings

logger = logging.getLogger(__name__)

# Engine and SessionLocal are created lazily
_engine = None
_SessionLocal = None

def _get_engine():
    global _engine, _SessionLocal
    if _engine is None:
        settings = get_settings()
        db_url = settings.database_url
        if not db_url:
            raise ValueError("LAKEBASE_HOST is not configured.")
        
        logger.info(f"Connecting to Lakebase at {settings.lakebase_host}:{settings.lakebase_port}/{settings.lakebase_database}")
        _engine = create_engine(
            db_url,
            pool_size=5,
            max_overflow=10,
            pool_timeout=30,
            pool_recycle=1800,
            echo=False # Set to True for SQL debugging
        )
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    return _engine

def get_session() -> Iterator[Session]:
    """Yields a SQLAlchemy Session.
    
    This function expects the caller to handle committing/rolling back, 
    but it will ensure the session is safely closed after use.
    """
    _get_engine()  # Ensure engine is initialized
    session = _SessionLocal()
    try:
        yield session
    finally:
        session.close()

def is_database_configured() -> bool:
    """Helper to cleanly check if the DB environment variables are present."""
    settings = get_settings()
    return bool(settings.database_url)
