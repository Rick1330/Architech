from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..db.models import Design, DesignVersion, Component
from ..schemas.design import DesignCreate, DesignUpdate, DesignVersionCreate, ComponentCreate, ComponentUpdate
from typing import Optional, List
import uuid

def get_design_by_id(db: Session, design_id: uuid.UUID) -> Optional[Design]:
    """Get design by ID."""
    return db.query(Design).filter(Design.id == design_id).first()

def get_designs_by_project(db: Session, project_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Design]:
    """Get designs by project ID."""
    return db.query(Design).filter(Design.project_id == project_id).offset(skip).limit(limit).all()

def create_design(db: Session, design: DesignCreate, created_by: uuid.UUID) -> Design:
    """Create a new design."""
    db_design = Design(
        name=design.name,
        description=design.description,
        project_id=design.project_id,
        design_data=design.design_data,
        version=1,
    )
    db.add(db_design)
    db.commit()
    db.refresh(db_design)
    
    # Create initial version
    create_design_version(
        db=db,
        design_id=db_design.id,
        version=DesignVersionCreate(
            version_number=1,
            design_data=design.design_data,
            commit_message="Initial design creation",
            created_by=created_by
        )
    )
    
    return db_design