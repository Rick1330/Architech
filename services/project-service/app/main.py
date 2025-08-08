from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1.endpoints import projects
from .core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["projects"])

@app.get("/")
async def root():
    return {"message": "Project Service is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "project-service"}

