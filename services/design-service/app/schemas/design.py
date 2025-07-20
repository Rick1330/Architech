from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class DesignBase(BaseModel):
    name: str
    description: Optional[str] = None
    design_data: Dict[str, Any] = {}

class DesignCreate(DesignBase):
    project_id: uuid.UUID

class DesignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    design_data: Optional[Dict[str, Any]] = None

class DesignInDBBase(DesignBase):
    id: uuid.UUID
    project_id: uuid.UUID
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Design(DesignInDBBase):
    pass

class DesignVersionBase(BaseModel):
    version_number: int
    design_data: Dict[str, Any] = {}
    commit_message: Optional[str] = None

class DesignVersionCreate(DesignVersionBase):
    created_by: uuid.UUID

class DesignVersionInDBBase(DesignVersionBase):
    id: uuid.UUID
    design_id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime

    class Config:
        orm_mode = True

class DesignVersion(DesignVersionInDBBase):
    pass

class ComponentBase(BaseModel):
    name: str
    type: str
    category: str
    description: Optional[str] = None
    properties_schema: Dict[str, Any] = {}
    default_properties: Dict[str, Any] = {}
    icon_url: Optional[str] = None

class ComponentCreate(ComponentBase):
    is_custom: bool = False
    created_by: Optional[uuid.UUID] = None

class ComponentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    properties_schema: Optional[Dict[str, Any]] = None
    default_properties: Optional[Dict[str, Any]] = None
    icon_url: Optional[str] = None

class ComponentInDBBase(ComponentBase):
    id: uuid.UUID
    is_custom: bool
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Component(ComponentInDBBase):
    pass

class DesignWithVersions(Design):
    versions: List[DesignVersion] = []

