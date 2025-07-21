from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: Optional[bool] = False

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class ProjectInDBBase(ProjectBase):
    id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Project(ProjectInDBBase):
    pass

class ProjectCollaboratorBase(BaseModel):
    user_id: str
    role: str = "viewer"

class ProjectCollaboratorCreate(ProjectCollaboratorBase):
    pass

class ProjectCollaboratorUpdate(BaseModel):
    role: Optional[str] = None

class ProjectCollaboratorInDBBase(ProjectCollaboratorBase):
    id: str
    project_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectCollaborator(ProjectCollaboratorInDBBase):
    pass

class ProjectWithCollaborators(Project):
    collaborators: List[ProjectCollaborator] = []

