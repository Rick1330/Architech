from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx

from ....db.database import get_db
from ....schemas.project import (
    Project, ProjectCreate, ProjectUpdate, ProjectWithCollaborators,
    ProjectCollaborator, ProjectCollaboratorCreate, ProjectCollaboratorUpdate
)
from ....crud import project as crud_project
from ....core.config import settings

router = APIRouter()
security = HTTPBearer()

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
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
                return user_data["id"]
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

def check_project_permission(db: Session, user_id: str, project_id: str, required_role: str = "viewer"):
    """Check if user has required permission for project."""
    user_role = crud_project.check_user_project_access(db, user_id, project_id)
    
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )
    
    # Define role hierarchy
    role_hierarchy = {"viewer": 0, "editor": 1, "admin": 2, "owner": 3}
    
    if role_hierarchy.get(user_role, 0) < role_hierarchy.get(required_role, 0):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    return user_role

@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
def create_project(
    project: ProjectCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new project."""
    return crud_project.create_project(db=db, project=project, owner_id=current_user_id)

@router.get("/", response_model=List[Project])
def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    show_public: bool = Query(False),
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get projects for current user or public projects."""
    if show_public:
        return crud_project.get_public_projects(db, skip=skip, limit=limit)
    else:
        return crud_project.get_projects_by_user(db, user_id=current_user_id, skip=skip, limit=limit)

@router.get("/public", response_model=List[Project])
def get_public_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get public projects."""
    return crud_project.get_public_projects(db, skip=skip, limit=limit)

@router.get("/{project_id}", response_model=ProjectWithCollaborators)
def get_project(
    project_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get project by ID."""
    check_project_permission(db, current_user_id, project_id, "viewer")
    
    project = crud_project.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get collaborators
    collaborators = crud_project.get_project_collaborators(db, project_id)
    
    return ProjectWithCollaborators(
        **project.__dict__,
        collaborators=collaborators
    )

@router.put("/{project_id}", response_model=Project)
def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update project."""
    check_project_permission(db, current_user_id, project_id, "editor")
    
    updated_project = crud_project.update_project(db, project_id, project_update)
    if not updated_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return updated_project

@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete project."""
    check_project_permission(db, current_user_id, project_id, "owner")
    
    success = crud_project.delete_project(db, project_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return {"message": "Project deleted successfully"}

# Collaborator endpoints
@router.get("/{project_id}/collaborators", response_model=List[ProjectCollaborator])
def get_project_collaborators(
    project_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get project collaborators."""
    check_project_permission(db, current_user_id, project_id, "viewer")
    
    collaborators = crud_project.get_project_collaborators(db, project_id)
    return collaborators

@router.post("/{project_id}/collaborators", response_model=ProjectCollaborator, status_code=status.HTTP_201_CREATED)
def add_collaborator(
    project_id: str,
    collaborator: ProjectCollaboratorCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Add collaborator to project."""
    check_project_permission(db, current_user_id, project_id, "admin")
    
    db_collaborator = crud_project.add_collaborator(db, project_id, collaborator)
    if not db_collaborator:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a collaborator"
        )
    return db_collaborator

@router.put("/{project_id}/collaborators/{user_id}", response_model=ProjectCollaborator)
def update_collaborator(
    project_id: str,
    user_id: str,
    collaborator_update: ProjectCollaboratorUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update collaborator role."""
    check_project_permission(db, current_user_id, project_id, "admin")
    
    updated_collaborator = crud_project.update_collaborator(db, project_id, user_id, collaborator_update)
    if not updated_collaborator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collaborator not found"
        )
    return updated_collaborator

@router.delete("/{project_id}/collaborators/{user_id}")
def remove_collaborator(
    project_id: str,
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Remove collaborator from project."""
    check_project_permission(db, current_user_id, project_id, "admin")
    
    success = crud_project.remove_collaborator(db, project_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collaborator not found"
        )
    return {"message": "Collaborator removed successfully"}

