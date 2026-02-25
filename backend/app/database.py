from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# =====================================
# PostgreSQL URL
# =====================================
DATABASE_URL = "postgresql://postgres:1234@localhost:5432/webcrm"

# =====================================
# Engine
# =====================================
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=0
)

# =====================================
# Session
# =====================================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# =====================================
# Base
# =====================================
Base = declarative_base()


# =====================================
# DB Dependency (FastAPI)
# =====================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()