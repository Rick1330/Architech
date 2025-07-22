from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, Text, Integer, TypeDecorator
from sqlalchemy.types import JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .database import Base

class GUID(TypeDecorator):
    """Platform-independent GUID type."""
    impl = String
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                value = uuid.UUID(value)
            return value

class Design(Base):
    __tablename__ = "designs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    project_id = Column(GUID, nullable=False, index=True)
    design_data = Column(JSON, nullable=False, default={})
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    versions = relationship("DesignVersion", back_populates="design", cascade="all, delete-orphan")

class DesignVersion(Base):
    __tablename__ = "design_versions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    design_id = Column(GUID, ForeignKey("designs.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    design_data = Column(JSON, nullable=False, default={})
    commit_message = Column(String)
    created_by = Column(GUID, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    design = relationship("Design")

class Component(Base):
    __tablename__ = "components"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # service, database, queue, etc.
    category = Column(String, nullable=False)  # compute, storage, messaging, etc.
    description = Column(Text)
    properties_schema = Column(JSON, nullable=False, default={})
    default_properties = Column(JSON, nullable=False, default={})
    icon_url = Column(String)
    is_custom = Column(Boolean, default=False)
    created_by = Column(GUID)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

