from fastapi import APIRouter, Depends, HTTPException, status, Query, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import uuid
import json
import asyncio

from ....db.database import get_db
from ....schemas.simulation import (
    SimulationSession, SimulationSessionCreate, SimulationSessionUpdate, SimulationSessionWithDetails,
    SimulationEvent, SimulationEventCreate, SimulationMetric, SimulationMetricCreate,
    FaultInjection, FaultInjectionCreate
)
from ....crud import simulation as crud_simulation
from ....core.config import settings

router = APIRouter()
security = HTTPBearer()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.session_connections: dict = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        if session_id not in self.session_connections:
            self.session_connections[session_id] = []
        self.session_connections[session_id].append(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        self.active_connections.remove(websocket)
        if session_id in self.session_connections:
            self.session_connections[session_id].remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_session(self, message: str, session_id: str):
        if session_id in self.session_connections:
            for connection in self.session_connections[session_id]:
                await connection.send_text(message)

manager = ConnectionManager()

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> uuid.UUID:
    """Get current user ID from user service."""
    token = credentials.credentials
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.USER_SERVICE_URL}/api/v1/users/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.status_code == 200:
                user_data = response.json()
                return uuid.UUID(user_data["id"])
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials"
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )

async def check_design_access(design_id: uuid.UUID, user_id: uuid.UUID):
    """Check if user has access to the design."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.DESIGN_SERVICE_URL}/api/v1/designs/{design_id}",
                headers={"Authorization": f"Bearer {user_id}"}  # This would need proper token handling
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Design not found or access denied"
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error checking design access: {str(e)}"
            )

@router.post("/simulations", response_model=SimulationSession, status_code=status.HTTP_201_CREATED)
async def create_simulation_session(
    session: SimulationSessionCreate,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new simulation session."""
    await check_design_access(session.design_id, current_user_id)
    return crud_simulation.create_simulation_session(db=db, session=session, started_by=current_user_id)

@router.get("/simulations", response_model=List[SimulationSession])
async def get_simulation_sessions(
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    design_id: Optional[uuid.UUID] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get simulation sessions for current user or specific design."""
    if design_id:
        await check_design_access(design_id, current_user_id)
        return crud_simulation.get_simulation_sessions_by_design(db, design_id=design_id, skip=skip, limit=limit)
    else:
        return crud_simulation.get_simulation_sessions_by_user(db, user_id=current_user_id, skip=skip, limit=limit)

@router.get("/simulations/{session_id}", response_model=SimulationSessionWithDetails)
async def get_simulation_session(
    session_id: uuid.UUID,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get simulation session with all details."""
    session = crud_simulation.get_simulation_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    
    # Check if user has access to the design
    await check_design_access(session.design_id, current_user_id)
    
    # Get related data
    events = crud_simulation.get_simulation_events(db, session_id)
    metrics = crud_simulation.get_simulation_metrics(db, session_id)
    fault_injections = crud_simulation.get_fault_injections(db, session_id)
    
    return SimulationSessionWithDetails(
        **session.__dict__,
        events=events,
        metrics=metrics,
        fault_injections=fault_injections
    )

@router.put("/simulations/{session_id}", response_model=SimulationSession)
async def update_simulation_session(
    session_id: uuid.UUID,
    session_update: SimulationSessionUpdate,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update simulation session."""
    session = crud_simulation.get_simulation_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    
    await check_design_access(session.design_id, current_user_id)
    
    updated_session = crud_simulation.update_simulation_session(db, session_id, session_update)
    if not updated_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    return updated_session

@router.post("/simulations/{session_id}/start", response_model=SimulationSession)
async def start_simulation(
    session_id: uuid.UUID,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Start a simulation session."""
    session = crud_simulation.get_simulation_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    
    await check_design_access(session.design_id, current_user_id)
    
    if session.status not in ["created", "paused"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot start simulation in {session.status} state"
        )
    
    # TODO: Communicate with simulation engine to start the simulation
    started_session = crud_simulation.start_simulation_session(db, session_id)
    
    # Broadcast to WebSocket connections
    await manager.broadcast_to_session(
        json.dumps({"type": "simulation_started", "session_id": str(session_id)}),
        str(session_id)
    )
    
    return started_session

@router.post("/simulations/{session_id}/stop", response_model=SimulationSession)
async def stop_simulation(
    session_id: uuid.UUID,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Stop a simulation session."""
    session = crud_simulation.get_simulation_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    
    await check_design_access(session.design_id, current_user_id)
    
    if session.status != "running":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot stop simulation in {session.status} state"
        )
    
    # TODO: Communicate with simulation engine to stop the simulation
    stopped_session = crud_simulation.stop_simulation_session(db, session_id)
    
    # Broadcast to WebSocket connections
    await manager.broadcast_to_session(
        json.dumps({"type": "simulation_stopped", "session_id": str(session_id)}),
        str(session_id)
    )
    
    return stopped_session

@router.post("/simulations/{session_id}/pause", response_model=SimulationSession)
async def pause_simulation(
    session_id: uuid.UUID,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Pause a simulation session."""
    session = crud_simulation.get_simulation_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    
    await check_design_access(session.design_id, current_user_id)
    
    if session.status != "running":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot pause simulation in {session.status} state"
        )
    
    paused_session = crud_simulation.pause_simulation_session(db, session_id)
    
    # Broadcast to WebSocket connections
    await manager.broadcast_to_session(
        json.dumps({"type": "simulation_paused", "session_id": str(session_id)}),
        str(session_id)
    )
    
    return paused_session

@router.post("/simulations/{session_id}/resume", response_model=SimulationSession)
async def resume_simulation(
    session_id: uuid.UUID,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Resume a paused simulation session."""
    session = crud_simulation.get_simulation_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    
    await check_design_access(session.design_id, current_user_id)
    
    if session.status != "paused":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot resume simulation in {session.status} state"
        )
    
    resumed_session = crud_simulation.resume_simulation_session(db, session_id)
    
    # Broadcast to WebSocket connections
    await manager.broadcast_to_session(
        json.dumps({"type": "simulation_resumed", "session_id": str(session_id)}),
        str(session_id)
    )
    
    return resumed_session

@router.delete("/simulations/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_simulation_session(
    session_id: uuid.UUID,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete a simulation session."""
    session = crud_simulation.get_simulation_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    
    await check_design_access(session.design_id, current_user_id)
    
    success = crud_simulation.delete_simulation_session(db, session_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")

# Event endpoints
@router.post("/simulations/{session_id}/events", response_model=SimulationEvent, status_code=status.HTTP_201_CREATED)
async def create_simulation_event(
    session_id: uuid.UUID,
    event: SimulationEventCreate,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a simulation event (typically called by simulation engine)."""
    session = crud_simulation.get_simulation_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    
    created_event = crud_simulation.create_simulation_event(db, session_id, event)
    
    # Broadcast to WebSocket connections
    await manager.broadcast_to_session(
        json.dumps({
            "type": "simulation_event",
            "session_id": str(session_id),
            "event": {
                "id": str(created_event.id),
                "event_type": created_event.event_type,
                "component_id": created_event.component_id,
                "timestamp": created_event.timestamp,
                "data": created_event.data
            }
        }),
        str(session_id)
    )
    
    return created_event

@router.get("/simulations/{session_id}/events", response_model=List[SimulationEvent])
async def get_simulation_events(
    session_id: uuid.UUID,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=10000)
):
    """Get events for a simulation session."""
    session = crud_simulation.get_simulation_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    
    await check_design_access(session.design_id, current_user_id)
    
    return crud_simulation.get_simulation_events(db, session_id, skip=skip, limit=limit)

# Metric endpoints
@router.post("/simulations/{session_id}/metrics", response_model=SimulationMetric, status_code=status.HTTP_201_CREATED)
async def create_simulation_metric(
    session_id: uuid.UUID,
    metric: SimulationMetricCreate,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a simulation metric (typically called by simulation engine)."""
    session = crud_simulation.get_simulation_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    
    created_metric = crud_simulation.create_simulation_metric(db, session_id, metric)
    
    # Broadcast to WebSocket connections
    await manager.broadcast_to_session(
        json.dumps({
            "type": "simulation_metric",
            "session_id": str(session_id),
            "metric": {
                "id": str(created_metric.id),
                "metric_name": created_metric.metric_name,
                "component_id": created_metric.component_id,
                "timestamp": created_metric.timestamp,
                "value": created_metric.value,
                "unit": created_metric.unit,
                "tags": created_metric.tags
            }
        }),
        str(session_id)
    )
    
    return created_metric

@router.get("/simulations/{session_id}/metrics", response_model=List[SimulationMetric])
async def get_simulation_metrics(
    session_id: uuid.UUID,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10000, ge=1, le=100000)
):
    """Get metrics for a simulation session."""
    session = crud_simulation.get_simulation_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    
    await check_design_access(session.design_id, current_user_id)
    
    return crud_simulation.get_simulation_metrics(db, session_id, skip=skip, limit=limit)

# Fault injection endpoints
@router.post("/simulations/{session_id}/faults", response_model=FaultInjection, status_code=status.HTTP_201_CREATED)
async def create_fault_injection(
    session_id: uuid.UUID,
    fault: FaultInjectionCreate,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a fault injection for a simulation session."""
    session = crud_simulation.get_simulation_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    
    await check_design_access(session.design_id, current_user_id)
    
    created_fault = crud_simulation.create_fault_injection(db, session_id, fault)
    
    # TODO: Communicate with simulation engine to schedule the fault
    
    return created_fault

@router.get("/simulations/{session_id}/faults", response_model=List[FaultInjection])
async def get_fault_injections(
    session_id: uuid.UUID,
    current_user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get fault injections for a simulation session."""
    session = crud_simulation.get_simulation_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation session not found")
    
    await check_design_access(session.design_id, current_user_id)
    
    return crud_simulation.get_fault_injections(db, session_id)

# WebSocket endpoint for real-time updates
@router.websocket("/simulations/{session_id}/ws")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WebSocket messages if needed
            await manager.send_personal_message(f"Message received: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)


