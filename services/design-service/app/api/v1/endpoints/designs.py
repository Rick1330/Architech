from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import uuid

from ....db.database import get_db
from ....schemas.design import (
    Design, DesignCreate, DesignUpdate, DesignWithVersions,
    DesignVersion, Component, ComponentCreate, ComponentUpdate,
    DesignVersionCreate
)
from typing import List
from ....crud import design as crud_design
from ....core.config import settings

router = APIRouter()
security = HTTPBearer()

# Mock user ID for testing purposes
async def get_current_user_id() -> uuid.UUID:
    return uuid.uuid4()

@router.post("/designs/", response_model=Design, status_code=status.HTTP_201_CREATED)
async def create_design(
    design: DesignCreate,
    db: Session = Depends(get_db)
):
    """Create a new design for a project."""
    # In a real app, you'd get the current user ID from the auth token
    current_user_id = uuid.uuid4()
    return crud_design.create_design(db=db, design=design, created_by=current_user_id)

@router.get("/designs/project/{project_id}", response_model=List[Design])
async def list_designs_by_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """List all designs for a specific project."""
    return crud_design.get_designs_by_project(db, project_id=project_id)

from pydantic import ValidationError

@router.get("/designs/{design_id}", response_model=Design)
async def get_design(
    design_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Get a specific design by its ID."""
    try:
        design = crud_design.get_design_by_id(db, design_id=design_id)
        if not design:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")
        return design
    except ValidationError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")

@router.put("/designs/{design_id}", response_model=Design)
async def update_design(
    design_id: uuid.UUID,
    design_update: DesignUpdate,
    db: Session = Depends(get_db)
):
    """Update a design."""
    # In a real app, you'd get the current user ID from the auth token
    current_user_id = uuid.uuid4()
    updated_design = crud_design.update_design(db, design_id=design_id, design_update=design_update, updated_by=current_user_id)
    if not updated_design:
        raise HTTPException(status_code=404, detail="Design not found")
    return updated_design

@router.delete("/designs/{design_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_design(
    design_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Delete a design."""
    success = crud_design.delete_design(db, design_id=design_id)
    if not success:
        raise HTTPException(status_code=404, detail="Design not found")

@router.post("/designs/{design_id}/versions", response_model=DesignVersion, status_code=status.HTTP_201_CREATED)
async def create_design_version_endpoint(
    design_id: uuid.UUID,
    version_create: DesignVersionCreate,
    db: Session = Depends(get_db)
):
    """Create a new version for a design."""
    # In a real app, you'd get the current user ID from the auth token
    current_user_id = uuid.uuid4()
    version_create.created_by = current_user_id
    
    # You might want to add logic to auto-increment version number
    # For now, assuming it's provided in the request
    
    return crud_design.create_design_version(db=db, design_id=design_id, version=version_create)

@router.post("/components/", response_model=Component, status_code=status.HTTP_201_CREATED)
async def create_component(
    component: ComponentCreate,
    db: Session = Depends(get_db)
):
    """Create a new component."""
    # In a real app, created_by would come from the current user
    return crud_design.create_component(db=db, component=component, created_by=uuid.uuid4())

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
    component = crud_design.get_component_by_id(db, component_id=component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    return component

@router.put("/components/{component_id}", response_model=Component)
async def update_component(
    component_id: uuid.UUID,
    component_update: ComponentUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing component."""
    updated_component = crud_design.update_component(db, component_id=component_id, component=component_update)
    if not updated_component:
        raise HTTPException(status_code=404, detail="Component not found")
    return updated_component

@router.delete("/components/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_component(
    component_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Delete a component."""
    success = crud_design.delete_component(db, component_id=component_id)
    if not success:
        raise HTTPException(status_code=404, detail="Component not found")

