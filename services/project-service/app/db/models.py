from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from .database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    owner_id = Column(String, nullable=False, index=True)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ProjectCollaborator(Base):
    __tablename__ = "project_collaborators"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, nullable=False, index=True)
    role = Column(String, default="viewer")  # viewer, editor, admin
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    project = relationship("Project", backref="collaborators")



