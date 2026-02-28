import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# =====================================
# Load environment variables
# =====================================
load_dotenv()

# =====================================
# Database URL (.env dan olinadi)
# =====================================
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/webcrm"
)

# =====================================
# Engine Configuration
# =====================================
engine = create_engine(
    DATABASE_URL,
    pool_size=20,          # bir vaqtning o'zida 20 ta connection
    max_overflow=10,       # qo'shimcha 10 ta temporary connection
    pool_pre_ping=True,    # o‘lik connection ni tekshiradi
    echo=os.getenv("DEBUG", "False") == "True",
    future=True            # SQLAlchemy 2.0 style
)

# =====================================
# Session Configuration
# =====================================
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    future=True
)

# =====================================
# Base Model
# =====================================
Base = declarative_base()


# =====================================
# FastAPI Dependency
# =====================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()