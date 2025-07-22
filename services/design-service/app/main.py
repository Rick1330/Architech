from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1.endpoints import designs
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

app.include_router(designs.router, prefix=settings.API_V1_STR, tags=["designs"])

@app.get("/")
async def root():
    return {"message": "Design Service is running!"}




@app.get("/api/v1/health", tags=["health"])
def health_check():
    return {"status": "healthy"}


