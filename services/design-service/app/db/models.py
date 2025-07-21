from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.types import JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from .database import Base

class Design(Base):
    __tablename__ = "designs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    project_id = Column(String, nullable=False, index=True)
    design_data = Column(JSON, nullable=False, default={})
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class DesignVersion(Base):
    __tablename__ = "design_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    design_id = Column(String, ForeignKey("designs.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    design_data = Column(JSON, nullable=False, default={})
    commit_message = Column(String)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    design = relationship("Design", backref="versions")

class Component(Base):
    __tablename__ = "components"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # service, database, queue, etc.
    category = Column(String, nullable=False)  # compute, storage, messaging, etc.
    description = Column(Text)
    properties_schema = Column(JSON, nullable=False, default={})
    default_properties = Column(JSON, nullable=False, default={})
    icon_url = Column(String)
    is_custom = Column(Boolean, default=False)
    created_by = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

