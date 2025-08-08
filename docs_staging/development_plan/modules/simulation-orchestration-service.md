# Module: Simulation Orchestration Service

## 1. Overview

The Simulation Orchestration Service is the central control plane for managing the lifecycle of simulations within Architech. It acts as an intermediary between the frontend and the core Simulation Engine, handling requests to start, stop, and monitor simulations. This service is crucial for translating user intentions into executable simulation commands and for providing real-time feedback on simulation progress.

## 2. Key Responsibilities

*   **Simulation Lifecycle Management:** Initiates, pauses, resumes, and terminates simulation runs.
*   **Configuration Translation:** Fetches design configurations from the Design Service and translates them into a format consumable by the Simulation Engine.
*   **Simulation Engine Interaction:** Communicates with the Simulation Engine (e.g., via gRPC, message queues) to pass configurations and receive status updates.
*   **Real-time Progress Updates:** Maintains WebSocket connections with the frontend to stream real-time simulation metrics and status changes.
*   **State Management:** Tracks the current state of active simulations (e.g., running, paused, completed, failed).
*   **Error Handling:** Manages errors originating from the Simulation Engine or other dependencies and communicates them to the frontend.

## 3. Core Components and Files

### 3.1. `main.py`

*   **Description:** The FastAPI application entry point for the Simulation Orchestration Service. It initializes the application, sets up middleware, and defines the main application instance.
*   **Key Functions/Methods:**
    *   Application initialization and configuration.
    *   Middleware setup (CORS, logging, error handling).
    *   WebSocket endpoint registration.
*   **Interactions:** Coordinates all other components within the Simulation Orchestration Service.

### 3.2. `app/api/v1/endpoints/simulations.py`

*   **Description:** Defines the RESTful API endpoints for managing simulation runs. These endpoints are primarily consumed by the frontend.
*   **Key Endpoints:**
    *   `POST /simulations/start`: Initiates a new simulation run for a given design.
    *   `POST /simulations/{simulation_id}/stop`: Terminates an ongoing simulation.
    *   `GET /simulations/{simulation_id}/status`: Retrieves the current status of a simulation.
    *   `GET /simulations`: Lists all active or recent simulations for a user/project.
*   **Interactions:** Uses `simulation_manager.py` to perform simulation actions.

### 3.3. `app/services/simulation_manager.py`

*   **Description:** Contains the core business logic for managing simulation lifecycles. It orchestrates interactions with the Design Service, Simulation Engine, and WebSocket connections.
*   **Key Functions/Methods:**
    *   `start_simulation(design_id: str, user_id: str) -> SimulationRun`: Fetches design, configures engine, starts simulation.
    *   `stop_simulation(simulation_id: str) -> bool`: Sends stop command to engine, updates status.
    *   `get_simulation_status(simulation_id: str) -> SimulationStatus`: Retrieves current status.
    *   `handle_engine_event(event: dict)`: Processes events received from the Simulation Engine (e.g., metrics, logs) and broadcasts them to connected clients.
*   **Interactions:** Interacts with `design_service_client.py`, `simulation_engine_client.py`, and `connection_manager.py`.

### 3.4. `app/websockets/connection_manager.py`

*   **Description:** Manages active WebSocket connections with frontend clients. It handles connection establishment, termination, and broadcasting messages to specific clients or groups.
*   **Key Functions/Methods:**
    *   `connect(websocket: WebSocket, client_id: str)`: Establishes a new connection.
    *   `disconnect(websocket: WebSocket, client_id: str)`: Closes a connection.
    *   `send_personal_message(message: str, client_id: str)`: Sends a message to a specific client.
    *   `broadcast(message: str)`: Sends a message to all connected clients.
    *   `broadcast_to_simulation(simulation_id: str, message: str)`: Sends a message to clients subscribed to a specific simulation.
*   **Interactions:** Used by `simulation_manager.py` to push real-time updates to the frontend.

### 3.5. `app/clients/design_service_client.py`

*   **Description:** A client for interacting with the Design Service API to fetch design configurations for simulations.
*   **Key Functions/Methods:**
    *   `get_design(design_id: str) -> DesignSchema`: Fetches a detailed design by ID.
*   **Interactions:** Used by `simulation_manager.py`.

### 3.6. `app/clients/simulation_engine_client.py`

*   **Description:** A client for communicating with the Simulation Engine. This could be a gRPC client, a message queue producer, or an HTTP client depending on the engine's interface.
*   **Key Functions/Methods:**
    *   `start_engine_simulation(config: EngineConfig) -> str`: Sends a command to the engine to start a simulation.
    *   `stop_engine_simulation(engine_run_id: str) -> bool`: Sends a command to the engine to stop a simulation.
    *   `subscribe_to_engine_events(callback: Callable)`: Subscribes to a stream of events from the engine.
*   **Interactions:** Used by `simulation_manager.py` to control the Simulation Engine.

### 3.7. `app/models/simulation_run.py`

*   **Description:** Defines the data models for representing a simulation run, its status, and associated metadata.
*   **Key Models:**
    *   `SimulationRun`: Stores details about a specific simulation instance (ID, design_id, user_id, status, start_time, end_time).
    *   `SimulationStatus`: Enum for `RUNNING`, `PAUSED`, `COMPLETED`, `FAILED`.
*   **Interactions:** Used throughout the service to manage and track simulation state.

### 3.8. `app/core/config.py`

*   **Description:** Manages configuration settings for the Simulation Orchestration Service, including API endpoints for other services, WebSocket settings, and timeouts.
*   **Key Settings:**
    *   Design Service API URL
    *   Simulation Engine endpoint
    *   WebSocket URL
    *   Polling intervals or timeouts
*   **Interactions:** Used by all other components to access configuration settings.

## 4. Interaction with Other Modules

*   **Frontend:** The primary consumer of this service, interacting via REST APIs and WebSockets.
*   **Design Service:** Fetches design configurations to be simulated.
*   **Simulation Engine:** Sends commands to and receives events from the core simulation engine.
*   **Observability Data Service:** While not directly interacting in this phase, it will be the consumer of events emitted by the Simulation Engine, which this service orchestrates.

## 5. Design Considerations

*   **Scalability:** Must be able to handle a large number of concurrent simulation requests and real-time WebSocket connections.
*   **Resilience:** Should be robust to failures in the Simulation Engine or Design Service, with retry mechanisms and graceful degradation.
*   **Real-time Performance:** Optimized for low-latency communication with the frontend for live updates.
*   **State Management:** Careful management of simulation state to ensure consistency across restarts and failures.
*   **Security:** Proper authentication and authorization for starting/stopping simulations and accessing real-time data.

## 6. Verification

*   **Unit Tests:** Test individual functions within `simulation_manager.py` and `connection_manager.py`.
*   **Integration Tests:**
    *   Test API endpoints for starting/stopping simulations.
    *   Test WebSocket connection establishment and message broadcasting.
    *   Test communication with mock Design Service and Simulation Engine clients.
*   **End-to-End Tests:** Simulate a user starting a simulation from the UI and verify real-time updates are received and the simulation completes.
*   **Load Tests:** Assess the service's ability to handle concurrent simulation requests and WebSocket connections.

---

**Author:** Manus AI

**Date:** 2025-07-19


