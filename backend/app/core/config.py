import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Project root directory (4 levels up from config.py)
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Water Sustainability Assistant"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment & Host
    APP_ENV: str = os.getenv("APP_ENV", "development")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # Database (SQLite default; uses /tmp on Vercel serverless)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:////tmp/water_sustainability.db" if os.getenv("VERCEL") else f"sqlite:///{BASE_DIR / 'backend' / 'water_sustainability.db'}"
    )
    
    # IBM Granite API Credentials
    IBM_GRANITE_API_KEY: str = os.getenv("IBM_GRANITE_API_KEY", "")
    IBM_GRANITE_ENDPOINT: str = os.getenv("IBM_GRANITE_ENDPOINT", "https://us-south.ml.cloud.ibm.com/ml/v1/deployments/granite-3-8b-instruct/text/generation")
    IBM_GRANITE_MODEL: str = os.getenv("IBM_GRANITE_MODEL", "ibm/granite-3-8b-instruct")
    
    # RAG Vector DB Path
    VECTOR_DB_PATH: str = os.getenv("VECTOR_DB_PATH", str(BASE_DIR / "data" / "vector_store"))
    KNOWLEDGE_DOCS_PATH: str = os.getenv("KNOWLEDGE_DOCS_PATH", str(BASE_DIR / "data" / "knowledge"))
    DEMO_DATASET_PATH: str = os.getenv("DEMO_DATASET_PATH", str(BASE_DIR / "data" / "demo" / "sample_water_consumption.csv"))
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

