from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1.endpoints import gateway
from .core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:12000", # Vite dev server
        "http://frontend:3000",   # Docker container
        "http://127.0.0.1:3000",
        "http://127.0.0.1:12000",
        "*"  # Allow all origins for development - restrict in production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=[
        "*",
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "User-Agent",
        "DNT",
        "Cache-Control",
        "X-Mx-ReqToken",
        "Keep-Alive",
        "X-Requested-With",
        "If-Modified-Since",
        "X-CSRFToken"
    ],
)

app.include_router(gateway.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Architech API Gateway is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api-gateway"}

