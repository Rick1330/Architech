# Phase 5: Simulation Orchestration & Basic UI Integration

## Goal
Connect the frontend to the simulation engine, allowing users to start, stop, and monitor basic simulations from the UI.

## 1. WHAT TO BUILD

### 1.1. Simulation Orchestration Service

*   **Description:** Develop a new service responsible for managing the lifecycle of simulations. It will receive simulation requests from the frontend, interact with the Simulation Engine, and manage simulation state.
*   **Files to be created:**
    *   `./services/simulation-orchestration-service/Dockerfile`: Dockerfile for the service.
    *   `./services/simulation-orchestration-service/requirements.txt`: Python dependencies.
    *   `./services/simulation-orchestration-service/main.py`: FastAPI application entry point.
    *   `./services/simulation-orchestration-service/app/api/v1/endpoints/simulations.py`: API endpoints for starting/stopping simulations.
    *   `./services/simulation-orchestration-service/app/core/config.py`: Configuration settings.
    *   `./services/simulation-orchestration-service/app/services/simulation_manager.py`: Logic for managing simulation state, interacting with the Simulation Engine, and handling real-time communication.
    *   `./services/simulation-orchestration-service/app/websockets/connection_manager.py`: WebSocket connection management.
    *   `./services/simulation-orchestration-service/tests/test_simulations.py`: Unit and integration tests.
*   **File Locations:** `./services/simulation-orchestration-service/`
*   **Component Interaction:**
    *   Receives HTTP requests from the frontend to start/stop simulations.
    *   Communicates with the Design Service to fetch the design to be simulated.
    *   Sends simulation configurations to the Simulation Engine (e.g., via gRPC or a message queue).
    *   Manages WebSocket connections with the frontend for real-time updates.

### 1.2. Real-time Communication (WebSockets)

*   **Description:** Implement WebSocket communication between the frontend and the Simulation Orchestration Service to push real-time simulation progress and basic metrics to the UI.
*   **Files to be created/modified:**
    *   `./services/simulation-orchestration-service/app/websockets/connection_manager.py`: (Refine) Logic for handling WebSocket connections, broadcasting messages.
    *   `./frontend/src/websockets/simulationSocket.js`: Frontend WebSocket client for simulation updates.
    *   `./frontend/src/store/simulationSlice.js`: Redux/Vuex/NgRx slice for managing real-time simulation data.
*   **File Locations:** `./services/simulation-orchestration-service/app/websockets/`, `./frontend/src/websockets/`, `./frontend/src/store/`
*   **Component Interaction:** The frontend establishes a WebSocket connection with the Simulation Orchestration Service. The service pushes updates (e.g., `simulation_started`, `metrics_updated`, `simulation_stopped`) to the frontend.

### 1.3. Frontend Simulation Controls

*   **Description:** Add UI elements to the frontend for starting, stopping, and pausing simulations.
*   **Files to be created/modified:**
    *   `./frontend/src/components/SimulationControls/SimulationControls.js`: UI component with Start, Stop, Pause buttons.
    *   `./frontend/src/views/DesignEditorPage.js`: (Modify) Integrate `SimulationControls` component.
    *   `./frontend/src/store/simulationSlice.js`: (Modify) Add actions for starting/stopping simulations via API calls.
*   **File Locations:** `./frontend/src/components/SimulationControls/`, `./frontend/src/views/`, `./frontend/src/store/`
*   **Component Interaction:** User clicks on control buttons trigger API calls to the Simulation Orchestration Service.

### 1.4. Basic Real-time Metrics Display

*   **Description:** Implement a simple UI panel to display basic, real-time metrics received from the Simulation Orchestration Service via WebSockets.
*   **Files to be created:**
    *   `./frontend/src/components/MetricsPanel/BasicMetricsPanel.js`: UI component to display key metrics.
    *   `./frontend/src/components/MetricsPanel/MetricCard.js`: Reusable card for displaying a single metric (e.g., Total Requests, Average Latency).
*   **File Locations:** `./frontend/src/components/MetricsPanel/`
*   **Component Interaction:** The `BasicMetricsPanel` subscribes to the simulation state and updates in real-time as new metrics are received via WebSockets.

## 2. WHO BUILDS IT

*   **Manus:**
    *   Scaffolds the `simulation-orchestration-service` directory and initial file structure.
    *   Defines the API contract for the service.
    *   Implements the WebSocket connection management on the backend.
*   **Cursor:**
    *   Implements the detailed logic within `simulation_manager.py` for interacting with the Simulation Engine.
    *   Implements the frontend WebSocket client (`simulationSocket.js`) and state management (`simulationSlice.js`).
    *   Develops the `SimulationControls` and `BasicMetricsPanel` UI components.
    *   Writes unit and integration tests for both backend and frontend components.
*   **Human Dev Team (Oversight):**
    *   Reviews the architecture of the Simulation Orchestration Service.
    *   Defines the data format for real-time communication.
    *   Conducts manual E2E testing of the simulation start/stop flow.

## 3. HOW TO VERIFY

### 3.1. Simulation Orchestration Service Verification

*   **Test Specs:**
    *   Unit tests for `simulation_manager.py` to verify state management logic.
    *   Integration tests for API endpoints (`/simulations/start`, `/simulations/stop`).
    *   Integration tests with a mock Simulation Engine to verify communication.
*   **Metrics/Checkpoints:**
    *   All unit and integration tests pass.
    *   API response times < 50ms.
*   **Expected Output/Review Checklist:**
    *   `pytest` output shows 100% pass rate.
    *   API calls correctly trigger simulation start/stop logic.

### 3.2. Real-time Communication (WebSockets) Verification

*   **Test Specs:**
    *   Backend tests to verify WebSocket connection handling and message broadcasting.
    *   Frontend tests to verify WebSocket client connection and message reception.
    *   E2E test: Start a simulation and verify that the frontend receives a continuous stream of metric updates.
*   **Metrics/Checkpoints:**
    *   WebSocket connection is stable.
    *   Message latency is low (< 100ms).
*   **Expected Output/Review Checklist:**
    *   Browser dev tools show successful WebSocket connection and message flow.
    *   Frontend state updates correctly based on received messages.

### 3.3. Frontend Simulation Controls Verification

*   **Test Specs:**
    *   Manual testing: Click Start, Stop, Pause buttons and verify the UI state changes accordingly.
    *   Verify that clicking the buttons triggers the correct API calls to the backend.
*   **Metrics/Checkpoints:** UI is responsive; API calls are made correctly.
*   **Expected Output/Review Checklist:**
    *   Network tab in browser dev tools shows correct API requests on button clicks.
    *   UI state (e.g., button disabled/enabled) reflects the current simulation state.

### 3.4. Basic Real-time Metrics Display Verification

*   **Test Specs:**
    *   Manual testing: Start a simulation and observe the `BasicMetricsPanel`.
    *   Verify that the displayed metrics update in real-time and are consistent with the simulation progress.
*   **Metrics/Checkpoints:** Metrics update smoothly without flickering; data is accurate.
*   **Expected Output/Review Checklist:**
    *   UI displays plausible metric values (e.g., request count increases, latency is within expected range).
    *   No visual glitches in the metrics display.

---

**Author:** Manus AI

**Date:** 2025-07-19


