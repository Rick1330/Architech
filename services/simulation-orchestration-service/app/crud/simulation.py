from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from ..db.models import SimulationSession, SimulationEvent, SimulationMetric, FaultInjection
from ..schemas.simulation import (
    SimulationSessionCreate, SimulationSessionUpdate, 
    SimulationEventCreate, SimulationMetricCreate, FaultInjectionCreate
)
from typing import Optional, List
import uuid
from datetime import datetime

def get_simulation_session_by_id(db: Session, session_id: uuid.UUID) -> Optional[SimulationSession]:
    """Get simulation session by ID."""
    return db.query(SimulationSession).filter(SimulationSession.id == session_id).first()

def get_simulation_sessions_by_design(db: Session, design_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[SimulationSession]:
    """Get simulation sessions by design ID."""
    return db.query(SimulationSession).filter(
        SimulationSession.design_id == design_id
    ).order_by(desc(SimulationSession.created_at)).offset(skip).limit(limit).all()

def get_simulation_sessions_by_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[SimulationSession]:
    """Get simulation sessions started by a user."""
    return db.query(SimulationSession).filter(
        SimulationSession.started_by == user_id
    ).order_by(desc(SimulationSession.created_at)).offset(skip).limit(limit).all()

def create_simulation_session(db: Session, session: SimulationSessionCreate, started_by: uuid.UUID) -> SimulationSession:
    """Create a new simulation session."""
    db_session = SimulationSession(
        design_id=session.design_id,
        name=session.name,
        description=session.description,
        configuration=session.configuration,
        started_by=started_by,
        status="created"
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def update_simulation_session(db: Session, session_id: uuid.UUID, session_update: SimulationSessionUpdate) -> Optional[SimulationSession]:
    """Update simulation session."""
    db_session = get_simulation_session_by_id(db, session_id)
    if not db_session:
        return None
    
    update_data = session_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_session, field, value)
    
    db.commit()
    db.refresh(db_session)
    return db_session

def start_simulation_session(db: Session, session_id: uuid.UUID) -> Optional[SimulationSession]:
    """Start a simulation session."""
    db_session = get_simulation_session_by_id(db, session_id)
    if not db_session:
        return None
    
    db_session.status = "running"
    db_session.started_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_session)
    return db_session

def stop_simulation_session(db: Session, session_id: uuid.UUID) -> Optional[SimulationSession]:
    """Stop a simulation session."""
    db_session = get_simulation_session_by_id(db, session_id)
    if not db_session:
        return None
    
    db_session.status = "completed"
    db_session.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_session)
    return db_session

def pause_simulation_session(db: Session, session_id: uuid.UUID) -> Optional[SimulationSession]:
    """Pause a simulation session."""
    db_session = get_simulation_session_by_id(db, session_id)
    if not db_session:
        return None
    
    db_session.status = "paused"
    
    db.commit()
    db.refresh(db_session)
    return db_session

def resume_simulation_session(db: Session, session_id: uuid.UUID) -> Optional[SimulationSession]:
    """Resume a paused simulation session."""
    db_session = get_simulation_session_by_id(db, session_id)
    if not db_session:
        return None
    
    db_session.status = "running"
    
    db.commit()
    db.refresh(db_session)
    return db_session

def delete_simulation_session(db: Session, session_id: uuid.UUID) -> bool:
    """Delete a simulation session."""
    db_session = get_simulation_session_by_id(db, session_id)
    if not db_session:
        return False
    
    db.delete(db_session)
    db.commit()
    return True

# Event CRUD operations
def create_simulation_event(db: Session, session_id: uuid.UUID, event: SimulationEventCreate) -> SimulationEvent:
    """Create a simulation event."""
    db_event = SimulationEvent(
        session_id=session_id,
        event_type=event.event_type,
        component_id=event.component_id,
        timestamp=event.timestamp,
        data=event.data
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def get_simulation_events(db: Session, session_id: uuid.UUID, skip: int = 0, limit: int = 1000) -> List[SimulationEvent]:
    """Get events for a simulation session."""
    return db.query(SimulationEvent).filter(
        SimulationEvent.session_id == session_id
    ).order_by(SimulationEvent.timestamp).offset(skip).limit(limit).all()

def get_simulation_events_by_component(db: Session, session_id: uuid.UUID, component_id: str) -> List[SimulationEvent]:
    """Get events for a specific component in a simulation session."""
    return db.query(SimulationEvent).filter(
        and_(SimulationEvent.session_id == session_id, SimulationEvent.component_id == component_id)
    ).order_by(SimulationEvent.timestamp).all()

# Metric CRUD operations
def create_simulation_metric(db: Session, session_id: uuid.UUID, metric: SimulationMetricCreate) -> SimulationMetric:
    """Create a simulation metric."""
    db_metric = SimulationMetric(
        session_id=session_id,
        metric_name=metric.metric_name,
        component_id=metric.component_id,
        timestamp=metric.timestamp,
        value=metric.value,
        unit=metric.unit,
        tags=metric.tags
    )
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

def get_simulation_metrics(db: Session, session_id: uuid.UUID, skip: int = 0, limit: int = 10000) -> List[SimulationMetric]:
    """Get metrics for a simulation session."""
    return db.query(SimulationMetric).filter(
        SimulationMetric.session_id == session_id
    ).order_by(SimulationMetric.timestamp).offset(skip).limit(limit).all()

def get_simulation_metrics_by_component(db: Session, session_id: uuid.UUID, component_id: str) -> List[SimulationMetric]:
    """Get metrics for a specific component in a simulation session."""
    return db.query(SimulationMetric).filter(
        and_(SimulationMetric.session_id == session_id, SimulationMetric.component_id == component_id)
    ).order_by(SimulationMetric.timestamp).all()

def get_simulation_metrics_by_name(db: Session, session_id: uuid.UUID, metric_name: str) -> List[SimulationMetric]:
    """Get metrics by name for a simulation session."""
    return db.query(SimulationMetric).filter(
        and_(SimulationMetric.session_id == session_id, SimulationMetric.metric_name == metric_name)
    ).order_by(SimulationMetric.timestamp).all()

# Fault Injection CRUD operations
def create_fault_injection(db: Session, session_id: uuid.UUID, fault: FaultInjectionCreate) -> FaultInjection:
    """Create a fault injection."""
    db_fault = FaultInjection(
        session_id=session_id,
        fault_type=fault.fault_type,
        target_component=fault.target_component,
        parameters=fault.parameters,
        start_time=fault.start_time,
        duration=fault.duration,
        status="scheduled"
    )
    db.add(db_fault)
    db.commit()
    db.refresh(db_fault)
    return db_fault

def get_fault_injections(db: Session, session_id: uuid.UUID) -> List[FaultInjection]:
    """Get fault injections for a simulation session."""
    return db.query(FaultInjection).filter(
        FaultInjection.session_id == session_id
    ).order_by(FaultInjection.start_time).all()

def update_fault_injection_status(db: Session, fault_id: uuid.UUID, status: str) -> Optional[FaultInjection]:
    """Update fault injection status."""
    db_fault = db.query(FaultInjection).filter(FaultInjection.id == fault_id).first()
    if not db_fault:
        return None
    
    db_fault.status = status
    db.commit()
    db.refresh(db_fault)
    return db_fault

def delete_fault_injection(db: Session, fault_id: uuid.UUID) -> bool:
    """Delete a fault injection."""
    db_fault = db.query(FaultInjection).filter(FaultInjection.id == fault_id).first()
    if not db_fault:
        return False
    
    db.delete(db_fault)
    db.commit()
    return True

