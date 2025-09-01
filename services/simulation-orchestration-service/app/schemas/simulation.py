from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class SimulationSessionBase(BaseModel):
    design_id: uuid.UUID
    name: str
    description: Optional[str] = None
    configuration: Dict[str, Any] = {}

class SimulationSessionCreate(SimulationSessionBase):
    pass

class SimulationSessionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None
    results: Optional[Dict[str, Any]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class SimulationSessionInDBBase(SimulationSessionBase):
    id: uuid.UUID
    status: str
    results: Dict[str, Any]
    started_by: uuid.UUID
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class SimulationSession(SimulationSessionInDBBase):
    pass

class SimulationEventBase(BaseModel):
    event_type: str
    component_id: Optional[str] = None
    timestamp: float
    data: Dict[str, Any] = {}

class SimulationEventCreate(SimulationEventBase):
    pass

class SimulationEventInDBBase(SimulationEventBase):
    id: uuid.UUID
    session_id: uuid.UUID
    created_at: datetime

    class Config:
        orm_mode = True

class SimulationEvent(SimulationEventInDBBase):
    pass

class SimulationMetricBase(BaseModel):
    metric_name: str
    component_id: Optional[str] = None
    timestamp: float
    value: float
    unit: Optional[str] = None
    tags: Dict[str, Any] = {}

class SimulationMetricCreate(SimulationMetricBase):
    pass

class SimulationMetricInDBBase(SimulationMetricBase):
    id: uuid.UUID
    session_id: uuid.UUID
    created_at: datetime

    class Config:
        orm_mode = True

class SimulationMetric(SimulationMetricInDBBase):
    pass

class FaultInjectionBase(BaseModel):
    fault_type: str
    target_component: str
    parameters: Dict[str, Any] = {}
    start_time: float
    duration: Optional[float] = None

class FaultInjectionCreate(FaultInjectionBase):
    pass

class FaultInjectionInDBBase(FaultInjectionBase):
    id: uuid.UUID
    session_id: uuid.UUID
    status: str
    created_at: datetime

    class Config:
        orm_mode = True

class FaultInjection(FaultInjectionInDBBase):
    pass

class SimulationSessionWithDetails(SimulationSession):
    events: List[SimulationEvent] = []
    metrics: List[SimulationMetric] = []
    fault_injections: List[FaultInjection] = []

