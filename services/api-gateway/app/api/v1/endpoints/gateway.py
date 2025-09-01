from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import Response
import httpx
from typing import Any
import json

from ....core.config import settings

router = APIRouter()

# Service routing configuration
SERVICE_ROUTES = {
    "/users": settings.USER_SERVICE_URL,
    "/projects": settings.PROJECT_SERVICE_URL,
    "/designs": settings.DESIGN_SERVICE_URL,
    "/simulations": settings.SIMULATION_SERVICE_URL,
    "/ai": settings.AI_SERVICE_URL,
    "/observability": settings.OBSERVABILITY_SERVICE_URL,
}

async def proxy_request(
    request: Request,
    target_url: str,
    path: str,
    method: str = "GET"
) -> Response:
    """Proxy request to target service."""
    
    # Prepare headers (exclude host and content-length)
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None)
    
    # Get request body if present
    body = None
    if method in ["POST", "PUT", "PATCH"]:
        body = await request.body()
    
    # Prepare query parameters
    query_params = dict(request.query_params)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.request(
                method=method,
                url=f"{target_url}{path}",
                headers=headers,
                params=query_params,
                content=body
            )
            
            # Prepare response headers
            response_headers = dict(response.headers)
            response_headers.pop("content-length", None)
            response_headers.pop("transfer-encoding", None)
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=response_headers,
                media_type=response.headers.get("content-type")
            )
            
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Service timeout"
            )
        except httpx.ConnectError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service unavailable"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gateway error: {str(e)}"
            )

def get_service_url(path: str) -> str:
    """Get the target service URL based on the request path."""
    for route_prefix, service_url in SERVICE_ROUTES.items():
        if path.startswith(route_prefix):
            return service_url
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Service not found"
    )

# Dynamic route handlers for all HTTP methods
@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def gateway_proxy(request: Request, path: str):
    """Main gateway proxy handler."""
    
    # Add leading slash if not present
    if not path.startswith("/"):
        path = f"/{path}"
    
    # Get target service URL
    service_url = get_service_url(path)
    
    # Proxy the request
    return await proxy_request(
        request=request,
        target_url=service_url,
        path=f"/api/v1{path}",
        method=request.method
    )

