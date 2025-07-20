import os
from typing import Optional
from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Architech Project Service"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://architech:architech_password@localhost:5432/architech")
    
    # External Services
    USER_SERVICE_URL: str = os.getenv("USER_SERVICE_URL", "http://localhost:8001")
    
    class Config:
        case_sensitive = True

settings = Settings()

