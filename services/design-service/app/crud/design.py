from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..db.models import Design, DesignVersion, Component
from ..schemas.design import DesignCreate, DesignUpdate, DesignVersionCreate, ComponentCreate, ComponentUpdate
from typing import Optional, List
import uuid

def create_design_version(db: Session, design_id: str, version: DesignVersionCreate) -> DesignVersion:
    """Create a new version for a design."""
    db_version = DesignVersion(
        design_id=design_id,
        version_number=version.version_number,
        design_data=version.design_data,
        commit_message=version.commit_message,
        created_by=version.created_by
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version

def get_design_by_id(db: Session, design_id: uuid.UUID) -> Optional[Design]:
    """Get design by ID."""
    return db.query(Design).filter(Design.id == design_id).first()

def get_designs_by_project(db: Session, project_id: str, skip: int = 0, limit: int = 100) -> List[Design]:
    """Get designs by project ID."""
    return db.query(Design).filter(Design.project_id == project_id).offset(skip).limit(limit).all()

def create_design(db: Session, design: DesignCreate, created_by: uuid.UUID) -> Design:
    """Create a new design."""
    db_design = Design(
        name=design.name,
        description=design.description,
        project_id=design.project_id,
        design_data={},  # Default value
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
            design_data=design.design_data if hasattr(design, 'design_data') and design.design_data else {},
            commit_message="Initial design creation",
            created_by=created_by
        )
    )
    
    return db_design

def update_design(db: Session, design_id: uuid.UUID, design_update: DesignUpdate, updated_by: uuid.UUID) -> Optional[Design]:
    """Update a design and create a new version."""
    db_design = db.query(Design).filter(Design.id == design_id).first()
    if not db_design:
        return None

    # Create a new version before updating
    latest_version = db.query(DesignVersion).filter(DesignVersion.design_id == design_id).order_by(desc(DesignVersion.version_number)).first()
    new_version_number = (latest_version.version_number + 1) if latest_version else 1

    create_design_version(
        db=db,
        design_id=design_id,
        version=DesignVersionCreate(
            version_number=new_version_number,
            design_data=design_update.design_data if hasattr(design_update, 'design_data') else db_design.design_data,
            commit_message=f"Version {new_version_number}",
            created_by=updated_by
        )
    )

    # Update the main design record
    db_design.name = design_update.name
    db_design.description = design_update.description
    db_design.version = new_version_number
    if hasattr(design_update, 'design_data'):
        db_design.design_data = design_update.design_data

    db.commit()
    db.refresh(db_design)
    return db_design

def delete_design(db: Session, design_id: uuid.UUID):
    """Delete a design."""
    db_design = db.query(Design).filter(Design.id == design_id).first()
    if db_design:
        db.delete(db_design)
        db.commit()
        return True
    return False

def get_design_versions(db: Session, design_id: str, skip: int = 0, limit: int = 100) -> List[DesignVersion]:
    """Get all versions for a design."""
    return db.query(DesignVersion).filter(DesignVersion.design_id == design_id).order_by(desc(DesignVersion.version_number)).offset(skip).limit(limit).all()

def get_design_version_by_number(db: Session, design_id: str, version_number: int) -> Optional[DesignVersion]:
    """Get a specific version of a design."""
    return db.query(DesignVersion).filter(DesignVersion.design_id == design_id, DesignVersion.version_number == version_number).first()

def create_component(db: Session, component: ComponentCreate, created_by: str) -> Component:
    """Create a new component."""
    db_component = Component(
        name=component.name,
        type=component.type,
        category=component.category,
        description=component.description,
        properties_schema=component.properties_schema,
        default_properties=component.default_properties,
        icon_url=component.icon_url,
        is_custom=component.is_custom,
        created_by=created_by
    )
    db.add(db_component)
    db.commit()
    db.refresh(db_component)
    return db_component

def get_component_by_id(db: Session, component_id: str) -> Optional[Component]:
    """Get component by ID."""
    return db.query(Component).filter(Component.id == component_id).first()

def get_components(db: Session, skip: int = 0, limit: int = 100) -> List[Component]:
    """Get all components."""
    return db.query(Component).offset(skip).limit(limit).all()

def update_component(db: Session, component_id: str, component: ComponentUpdate) -> Optional[Component]:
    """Update an existing component."""
    db_component = db.query(Component).filter(Component.id == component_id).first()
    if db_component:
        for key, value in component.dict(exclude_unset=True).items():
            setattr(db_component, key, value)
        db.commit()
        db.refresh(db_component)
    return db_component

def delete_component(db: Session, component_id: str):
    """Delete a component."""
    db_component = db.query(Component).filter(Component.id == component_id).first()
    if db_component:
        db.delete(db_component)
        db.commit()
        return True
    return False


