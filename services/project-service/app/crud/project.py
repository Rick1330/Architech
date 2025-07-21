from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from ..db.models import Project, ProjectCollaborator
from ..schemas.project import ProjectCreate, ProjectUpdate, ProjectCollaboratorCreate, ProjectCollaboratorUpdate
from typing import Optional, List

def get_project_by_id(db: Session, project_id: str) -> Optional[Project]:
    """Get project by ID."""
    return db.query(Project).filter(Project.id == project_id).first()

def get_projects_by_owner(db: Session, owner_id: str, skip: int = 0, limit: int = 100) -> List[Project]:
    """Get projects owned by a user."""
    return db.query(Project).filter(Project.owner_id == owner_id).offset(skip).limit(limit).all()

def get_projects_by_user(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Project]:
    """Get projects owned by or collaborated on by a user."""
    return db.query(Project).filter(
        or_(
            Project.owner_id == user_id,
            Project.id.in_(
                db.query(ProjectCollaborator.project_id).filter(ProjectCollaborator.user_id == user_id)
            )
        )
    ).offset(skip).limit(limit).all()

def get_public_projects(db: Session, skip: int = 0, limit: int = 100) -> List[Project]:
    """Get public projects."""
    return db.query(Project).filter(Project.is_public == True).offset(skip).limit(limit).all()

def create_project(db: Session, project: ProjectCreate, owner_id: str) -> Project:
    """Create a new project."""
    db_project = Project(
        name=project.name,
        description=project.description,
        owner_id=owner_id,
        is_public=project.is_public,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: str, project_update: ProjectUpdate) -> Optional[Project]:
    """Update project information."""
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        return None
    
    update_data = project_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: str) -> bool:
    """Delete a project."""
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        return False
    
    db.delete(db_project)
    db.commit()
    return True

def check_user_project_access(db: Session, user_id: str, project_id: str) -> Optional[str]:
    """Check if user has access to project and return their role."""
    # Check if user is the owner
    project = get_project_by_id(db, project_id)
    if not project:
        return None
    
    if project.owner_id == user_id:
        return "owner"
    
    # Check if user is a collaborator
    collaborator = db.query(ProjectCollaborator).filter(
        and_(
            ProjectCollaborator.project_id == project_id,
            ProjectCollaborator.user_id == user_id
        )
    ).first()
    
    if collaborator:
        return collaborator.role
    
    # Check if project is public
    if project.is_public:
        return "viewer"
    
    return None

def get_project_collaborators(db: Session, project_id: str) -> List[ProjectCollaborator]:
    """Get all collaborators for a project."""
    return db.query(ProjectCollaborator).filter(ProjectCollaborator.project_id == project_id).all()

def add_collaborator(db: Session, project_id: str, collaborator: ProjectCollaboratorCreate) -> Optional[ProjectCollaborator]:
    """Add a collaborator to a project."""
    # Check if user is already a collaborator
    existing = db.query(ProjectCollaborator).filter(
        and_(
            ProjectCollaborator.project_id == project_id,
            ProjectCollaborator.user_id == collaborator.user_id
        )
    ).first()
    
    if existing:
        return None  # User is already a collaborator
    
    db_collaborator = ProjectCollaborator(
        project_id=project_id,
        user_id=collaborator.user_id,
        role=collaborator.role
    )
    db.add(db_collaborator)
    db.commit()
    db.refresh(db_collaborator)
    return db_collaborator

def update_collaborator(db: Session, project_id: str, user_id: str, collaborator_update: ProjectCollaboratorUpdate) -> Optional[ProjectCollaborator]:
    """Update a collaborator's role."""
    db_collaborator = db.query(ProjectCollaborator).filter(
        and_(
            ProjectCollaborator.project_id == project_id,
            ProjectCollaborator.user_id == user_id
        )
    ).first()
    
    if not db_collaborator:
        return None
    
    update_data = collaborator_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_collaborator, field, value)
    
    db.commit()
    db.refresh(db_collaborator)
    return db_collaborator

def remove_collaborator(db: Session, project_id: str, user_id: str) -> bool:
    """Remove a collaborator from a project."""
    db_collaborator = db.query(ProjectCollaborator).filter(
        and_(
            ProjectCollaborator.project_id == project_id,
            ProjectCollaborator.user_id == user_id
        )
    ).first()
    
    if not db_collaborator:
        return False
    
    db.delete(db_collaborator)
    db.commit()
    return True

