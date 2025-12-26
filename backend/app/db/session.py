"""Database session management."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.config import settings

# Create SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Get database session.

    Yields:
        Database session

    Example:
        ```python
        @app.get("/batches")
        def get_batches(db: Session = Depends(get_db)):
            return db.query(Batch).all()
        ```
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
