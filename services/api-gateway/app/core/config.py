import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Architech API Gateway"
    API_V1_STR: str = "/api/v1"
    
    # Service URLs
    USER_SERVICE_URL: str = os.getenv("USER_SERVICE_URL", "http://user-service:8000")
    PROJECT_SERVICE_URL: str = os.getenv("PROJECT_SERVICE_URL", "http://project-service:8000")
    DESIGN_SERVICE_URL: str = os.getenv("DESIGN_SERVICE_URL", "http://design-service:8000")
    SIMULATION_SERVICE_URL: str = os.getenv("SIMULATION_SERVICE_URL", "http://simulation-orchestration-service:8000")
    AI_SERVICE_URL: str = os.getenv("AI_SERVICE_URL", "http://ai-service:8000")
    OBSERVABILITY_SERVICE_URL: str = os.getenv("OBSERVABILITY_SERVICE_URL", "http://observability-data-service:8000")
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    class Config:
        case_sensitive = True

settings = Settings()

