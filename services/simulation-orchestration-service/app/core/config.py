import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Architech Simulation Orchestration Service"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://architech:architech_password@localhost:5432/architech")
    
    # External Services
    DESIGN_SERVICE_URL: str = os.getenv("DESIGN_SERVICE_URL", "http://localhost:8003")
    SIMULATION_ENGINE_URL: str = os.getenv("SIMULATION_ENGINE_URL", "http://localhost:8080")
    
    # Redis for caching and session management
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    class Config:
        case_sensitive = True

settings = Settings()

