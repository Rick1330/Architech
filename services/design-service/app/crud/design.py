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

def update_design(db: Session, design_id: uuid.UUID, design_update: DesignUpdate, updated_by: uuid.UUID) -> Optional[Design]:
    """Update design and create new version."""
    db_design = get_design_by_id(db, design_id)
    if not db_design:
        return None
    
    update_data = design_update.dict(exclude_unset=True)
    
    # If design_data is being updated, increment version and create new version record
    if "design_data" in update_data:
        db_design.version += 1
        create_design_version(
            db=db,
            design_id=design_id,
            version=DesignVersionCreate(
                version_number=db_design.version,
                design_data=update_data["design_data"],
                commit_message=f"Design update - version {db_design.version}",
                created_by=updated_by
            )
        )
    
    for field, value in update_data.items():
        setattr(db_design, field, value)
    
    db.commit()
    db.refresh(db_design)
    return db_design

def delete_design(db: Session, design_id: uuid.UUID) -> bool:
    """Delete a design (soft delete by setting is_active to False)."""
    db_design = get_design_by_id(db, design_id)
    if not db_design:
        return False
    
    db_design.is_active = False
    db.commit()
    return True

def create_design_version(db: Session, design_id: uuid.UUID, version: DesignVersionCreate) -> DesignVersion:
    """Create a new design version."""
    db_version = DesignVersion(
        design_id=design_id,
        version_number=version.version_number,
        design_data=version.design_data,
        commit_message=version.commit_message,
        created_by=version.created_by,
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version

def get_design_versions(db: Session, design_id: uuid.UUID) -> List[DesignVersion]:
    """Get all versions of a design."""
    return db.query(DesignVersion).filter(
        DesignVersion.design_id == design_id
    ).order_by(desc(DesignVersion.version_number)).all()

def get_design_version(db: Session, design_id: uuid.UUID, version_number: int) -> Optional[DesignVersion]:
    """Get specific version of a design."""
    return db.query(DesignVersion).filter(
        DesignVersion.design_id == design_id,
        DesignVersion.version_number == version_number
    ).first()

def revert_design_to_version(db: Session, design_id: uuid.UUID, version_number: int, reverted_by: uuid.UUID) -> Optional[Design]:
    """Revert design to a specific version."""
    db_design = get_design_by_id(db, design_id)
    if not db_design:
        return None
    
    target_version = get_design_version(db, design_id, version_number)
    if not target_version:
        return None
    
    # Create new version with reverted data
    db_design.version += 1
    create_design_version(
        db=db,
        design_id=design_id,
        version=DesignVersionCreate(
            version_number=db_design.version,
            design_data=target_version.design_data,
            commit_message=f"Reverted to version {version_number}",
            created_by=reverted_by
        )
    )
    
    # Update current design data
    db_design.design_data = target_version.design_data
    db.commit()
    db.refresh(db_design)
    return db_design

# Component CRUD operations
def get_components(db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None) -> List[Component]:
    """Get available components."""
    query = db.query(Component)
    if category:
        query = query.filter(Component.category == category)
    return query.offset(skip).limit(limit).all()

def get_component_by_id(db: Session, component_id: uuid.UUID) -> Optional[Component]:
    """Get component by ID."""
    return db.query(Component).filter(Component.id == component_id).first()

def create_component(db: Session, component: ComponentCreate) -> Component:
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
        created_by=component.created_by,
    )
    db.add(db_component)
    db.commit()
    db.refresh(db_component)
    return db_component

def update_component(db: Session, component_id: uuid.UUID, component_update: ComponentUpdate) -> Optional[Component]:
    """Update component."""
    db_component = get_component_by_id(db, component_id)
    if not db_component:
        return None
    
    update_data = component_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_component, field, value)
    
    db.commit()
    db.refresh(db_component)
    return db_component

def delete_component(db: Session, component_id: uuid.UUID) -> bool:
    """Delete a component."""
    db_component = get_component_by_id(db, component_id)
    if not db_component:
        return False
    
    db.delete(db_component)
    db.commit()
    return True

