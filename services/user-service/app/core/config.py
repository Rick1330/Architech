import os
from typing import Optional
from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Architech User Service"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://architech:architech_password@localhost:5432/architech")
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Password hashing
    PWD_CONTEXT_SCHEMES: list = ["bcrypt"]
    PWD_CONTEXT_DEPRECATED: str = "auto"
    
    class Config:
        case_sensitive = True

settings = Settings()

