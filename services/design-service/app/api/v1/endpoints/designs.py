from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import uuid

from ....db.database import get_db
from ....schemas.design import (
    Design, DesignCreate, DesignUpdate, DesignWithVersions,
    DesignVersion, Component, ComponentCreate, ComponentUpdate
)
from ....crud import design as crud_design
from ....core.config import settings

router = APIRouter()
security = HTTPBearer()

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> uuid.UUID:
    """Get current user ID from user service."""
    token = credentials.credentials
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.USER_SERVICE_URL}/api/v1/users/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.status_code == 200:
                user_data = response.json()
                return uuid.UUID(user_data["id"])
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials"
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )

async def check_project_access(project_id: uuid.UUID, user_id: uuid.UUID, required_role: str = "viewer"):
    """Check if user has required permission for project using Project Service."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.PROJECT_SERVICE_URL}/api/v1/projects/{project_id}/access",
                params={"user_id": str(user_id)}
            )
            if response.status_code == 200:
                access_data = response.json()
                user_role = access_data.get("role")
                
                role_hierarchy = {"viewer": 0, "editor": 1, "admin": 2, "owner": 3}
                
                if role_hierarchy.get(user_role, -1) < role_hierarchy.get(required_role, 0):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Insufficient permissions for this project"
                    )
                return True
            elif response.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Could not verify project access"
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error checking project access: {str(e)}"
            )

@router.post("/designs", response_model=Design, status_code=status.HTTP_201_CREATED)
async def create_design(
    design: DesignCreate,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new design for a project."""
    await check_project_access(design.project_id, current_user_id, "editor")
    return crud_design.create_design(db=db, design=design, created_by=current_user_id)

@router.get("/projects/{project_id}/designs", response_model=List[Design])
async def get_designs_for_project(
    project_id: uuid.UUID,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all designs for a specific project."""
    await check_project_access(project_id, current_user_id, "viewer")
    return crud_design.get_designs_by_project(db, project_id=project_id, skip=skip, limit=limit)

@router.get("/designs/{design_id}", response_model=DesignWithVersions)
async def get_design(
    design_id: uuid.UUID,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get a design by its ID, including its versions."""
    design = crud_design.get_design_by_id(db, design_id)
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")
    
    await check_project_access(design.project_id, current_user_id, "viewer")
    
    versions = crud_design.get_design_versions(db, design_id)
    return DesignWithVersions(**design.__dict__, versions=versions)

@router.put("/designs/{design_id}", response_model=Design)
async def update_design(
    design_id: uuid.UUID,
    design_update: DesignUpdate,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update a design and create a new version."""
    design = crud_design.get_design_by_id(db, design_id)
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")
    
    await check_project_access(design.project_id, current_user_id, "editor")
    
    updated_design = crud_design.update_design(db, design_id, design_update, updated_by=current_user_id)
    if not updated_design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")
    return updated_design

@router.delete("/designs/{design_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_design(
    design_id: uuid.UUID,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete a design (soft delete)."""
    design = crud_design.get_design_by_id(db, design_id)
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")
    
    await check_project_access(design.project_id, current_user_id, "admin")
    
    success = crud_design.delete_design(db, design_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")

@router.post("/designs/{design_id}/revert/{version_number}", response_model=Design)
async def revert_design(
    design_id: uuid.UUID,
    version_number: int,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Revert a design to a specific version."""
    design = crud_design.get_design_by_id(db, design_id)
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")
    
    await check_project_access(design.project_id, current_user_id, "editor")
    
    reverted_design = crud_design.revert_design_to_version(db, design_id, version_number, reverted_by=current_user_id)
    if not reverted_design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found or design not found")
    return reverted_design

# Component Endpoints
@router.post("/components", response_model=Component, status_code=status.HTTP_201_CREATED)
async def create_component(
    component: ComponentCreate,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new component (can be custom)."""
    # Only allow custom components to be created by authenticated users
    if component.is_custom:
        component.created_by = current_user_id
    return crud_design.create_component(db=db, component=component)

@router.get("/components", response_model=List[Component])
async def get_components(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None)
):
    """Get all available components, optionally filtered by category."""
    return crud_design.get_components(db, skip=skip, limit=limit, category=category)

@router.get("/components/{component_id}", response_model=Component)
async def get_component(
    component_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Get a component by its ID."""
    component = crud_design.get_component_by_id(db, component_id)
    if not component:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Component not found")
    return component

@router.put("/components/{component_id}", response_model=Component)
async def update_component(
    component_id: uuid.UUID,
    component_update: ComponentUpdate,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update an existing component."""
    component = crud_design.get_component_by_id(db, component_id)
    if not component:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Component not found")
    
    # Only allow custom components to be updated by their creator or admins
    if component.is_custom and component.created_by != current_user_id:
        # In a real scenario, we'd also check for admin role
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own custom components")
    
    updated_component = crud_design.update_component(db, component_id, component_update)
    if not updated_component:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Component not found")
    return updated_component

@router.delete("/components/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_component(
    component_id: uuid.UUID,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete a component."""
    component = crud_design.get_component_by_id(db, component_id)
    if not component:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Component not found")
    
    # Only allow custom components to be deleted by their creator or admins
    if component.is_custom and component.created_by != current_user_id:
        # In a real scenario, we'd also check for admin role
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own custom components")
    
    success = crud_design.delete_component(db, component_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Component not found")

