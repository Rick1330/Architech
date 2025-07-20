from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, Text, Integer, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from .database import Base

class SimulationSession(Base):
    __tablename__ = "simulation_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    design_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="created")  # created, running, paused, completed, failed
    configuration = Column(JSONB, nullable=False, default={})
    results = Column(JSONB, default={})
    started_by = Column(UUID(as_uuid=True), nullable=False)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class SimulationEvent(Base):
    __tablename__ = "simulation_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("simulation_sessions.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String, nullable=False)  # component_event, network_event, fault_event, etc.
    component_id = Column(String)  # ID of the component in the design
    timestamp = Column(Float, nullable=False)  # Simulation timestamp
    data = Column(JSONB, nullable=False, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    session = relationship("SimulationSession", backref="events")

class SimulationMetric(Base):
    __tablename__ = "simulation_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("simulation_sessions.id", ondelete="CASCADE"), nullable=False)
    metric_name = Column(String, nullable=False)
    component_id = Column(String)  # ID of the component in the design
    timestamp = Column(Float, nullable=False)  # Simulation timestamp
    value = Column(Float, nullable=False)
    unit = Column(String)
    tags = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    session = relationship("SimulationSession", backref="metrics")

class FaultInjection(Base):
    __tablename__ = "fault_injections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("simulation_sessions.id", ondelete="CASCADE"), nullable=False)
    fault_type = Column(String, nullable=False)  # component_failure, network_partition, latency_spike, etc.
    target_component = Column(String, nullable=False)  # Component ID to inject fault into
    parameters = Column(JSONB, nullable=False, default={})
    start_time = Column(Float, nullable=False)  # When to start the fault (simulation time)
    duration = Column(Float)  # How long the fault lasts (None for permanent)
    status = Column(String, default="scheduled")  # scheduled, active, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    session = relationship("SimulationSession", backref="fault_injections")

