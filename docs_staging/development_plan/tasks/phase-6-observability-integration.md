# Phase 6: Observability Integration

## Goal
Implement comprehensive observability features within the simulation environment, displaying logs, detailed metrics, and traces in the UI.

## 1. WHAT TO BUILD

### 1.1. Observability Data Service

*   **Description:** Develop a new service responsible for ingesting, processing, and storing simulation logs, metrics, and traces emitted by the Simulation Engine. This service will act as a central hub for all observability data.
*   **Files to be created:**
    *   `./services/observability-data-service/Dockerfile`: Dockerfile for the service.
    *   `./services/observability-data-service/requirements.txt`: Python dependencies.
    *   `./services/observability-data-service/main.py`: FastAPI application entry point.
    *   `./services/observability-data-service/app/api/v1/endpoints/observability.py`: API endpoints for querying logs, metrics, and traces.
    *   `./services/observability-data-service/app/core/config.py`: Configuration settings.
    *   `./services/observability-data-service/app/consumers/kafka_consumer.py`: Kafka consumer for ingesting events from the Simulation Engine.
    *   `./services/observability-data-service/app/db/database.py`: Database connection and session management (e.g., for storing logs/traces in PostgreSQL or a document DB).
    *   `./services/observability-data-service/app/db/models.py`: SQLAlchemy models for `SimulationLog`, `SimulationMetric`, `SimulationTrace` (or similar).
    *   `./services/observability-data-service/app/crud/observability.py`: CRUD operations for observability data.
    *   `./services/observability-data-service/tests/test_observability.py`: Unit and integration tests.
*   **File Locations:** `./services/observability-data-service/`
*   **Component Interaction:**
    *   Consumes events from the Kafka topic where the Simulation Engine publishes its data.
    *   Provides RESTful API endpoints for the frontend to query historical and real-time observability data.

### 1.2. Frontend UI for Structured Log Viewer

*   **Description:** Implement a dedicated UI component to display structured simulation logs with filtering and search capabilities.
*   **Files to be created:**
    *   `./frontend/src/components/Observability/LogViewer.js`: Main log viewer component.
    *   `./frontend/src/components/Observability/LogEntry.js`: Component for displaying a single log entry.
    *   `./frontend/src/components/Observability/LogFilters.js`: UI for filtering logs by component, log level, time range.
    *   `./frontend/src/api/observabilityApi.js`: API client for querying logs from Observability Data Service.
    *   `./frontend/src/store/logSlice.js`: Redux/Vuex/NgRx slice for managing log data.
*   **File Locations:** `./frontend/src/components/Observability/`, `./frontend/src/api/`, `./frontend/src/store/`
*   **Component Interaction:** Fetches log data from the Observability Data Service via API calls. Displays logs in a scrollable, filterable view.

### 1.3. Frontend UI for Detailed Metrics Dashboards

*   **Description:** Develop interactive dashboards to visualize detailed simulation metrics (e.g., latency, throughput, error rates, resource utilization) per component.
*   **Files to be created:**
    *   `./frontend/src/components/Observability/MetricsDashboard.js`: Main metrics dashboard component.
    *   `./frontend/src/components/Observability/MetricChart.js`: Reusable chart component (e.g., using Chart.js, Recharts, or Plotly.js) for time-series data.
    *   `./frontend/src/components/Observability/ComponentMetricsPanel.js`: Displays metrics for a specific component.
    *   `./frontend/src/api/observabilityApi.js`: (Modify) Add API calls for querying metrics.
    *   `./frontend/src/store/metricSlice.js`: Redux/Vuex/NgRx slice for managing metric data.
*   **File Locations:** `./frontend/src/components/Observability/`, `./frontend/src/api/`, `./frontend/src/store/`
*   **Component Interaction:** Fetches metric data from the Observability Data Service via API calls. Renders charts and tables to visualize performance over time.

### 1.4. Frontend UI for Basic Trace Visualization

*   **Description:** Implement a basic UI to visualize end-to-end request traces, showing the path of a request through different components and their latencies.
*   **Files to be created:**
    *   `./frontend/src/components/Observability/TraceViewer.js`: Main trace viewer component.
    *   `./frontend/src/components/Observability/SpanDetail.js`: Component for displaying details of a single span.
    *   `./frontend/src/api/observabilityApi.js`: (Modify) Add API calls for querying traces.
    *   `./frontend/src/store/traceSlice.js`: Redux/Vuex/NgRx slice for managing trace data.
*   **File Locations:** `./frontend/src/components/Observability/`, `./frontend/src/api/`, `./frontend/src/store/`
*   **Component Interaction:** Fetches trace data from the Observability Data Service via API calls. Displays traces in a hierarchical or timeline view.

## 2. WHO BUILDS IT

*   **Manus:**
    *   Scaffolds the `observability-data-service` directory and initial file structure.
    *   Defines the database schema for logs, metrics, and traces.
    *   Sets up the Kafka consumer for ingesting simulation events.
*   **Cursor:**
    *   Implements the detailed logic within the `observability-data-service` (Kafka consumer, API endpoints, CRUD operations).
    *   Implements the `observabilityApi.js` client and integrates it with the frontend state management slices (`logSlice.js`, `metricSlice.js`, `traceSlice.js`).
    *   Develops the `LogViewer`, `MetricsDashboard`, and `TraceViewer` components, including data fetching and basic rendering logic.
    *   Writes comprehensive unit and integration tests for both backend and frontend observability components.
*   **Lovable/MGX.dev:**
    *   Focuses on the visual presentation and interactivity of the observability UI components (`LogViewer`, `MetricsDashboard`, `TraceViewer`).
    *   Ensures charts are visually appealing and easy to interpret.
    *   Refines the user experience for filtering, searching, and navigating observability data.
*   **Human Dev Team (Oversight):**
    *   Reviews the data models for observability data.
    *   Validates the accuracy and completeness of the displayed metrics and logs.
    *   Provides feedback on the usability and clarity of the observability dashboards.

## 3. HOW TO VERIFY

### 3.1. Observability Data Service Verification

*   **Test Specs:**
    *   Unit tests for Kafka consumer to ensure correct message parsing and ingestion.
    *   Integration tests for API endpoints (`/observability/logs`, `/observability/metrics`, `/observability/traces`) to verify data retrieval.
    *   E2E test: Run a simulation, then query the Observability Data Service to verify that all expected logs, metrics, and traces are stored and retrievable.
*   **Metrics/Checkpoints:**
    *   All unit and integration tests pass.
    *   Data ingestion rate matches simulation event emission rate.
    *   API response times for queries < 100ms (for typical data volumes).
*   **Expected Output/Review Checklist:**
    *   `pytest` output shows 100% pass rate.
    *   Kafka consumer logs show successful processing of events.
    *   API calls return correct and complete observability data.

### 3.2. Frontend UI for Structured Log Viewer Verification

*   **Test Specs:**
    *   Manual testing: Navigate to the log viewer, apply filters, and search for specific log entries.
    *   Automated UI tests (e.g., Cypress) to verify log display and filtering.
*   **Metrics/Checkpoints:** Logs load quickly; filtering is responsive.
*   **Expected Output/Review Checklist:**
    *   Log entries are displayed in chronological order.
    *   Filtering by component, level, or time range works as expected.
    *   No visual glitches or performance issues when scrolling through large log volumes.

### 3.3. Frontend UI for Detailed Metrics Dashboards Verification

*   **Test Specs:**
    *   Manual testing: Navigate to the metrics dashboard, select different components, and view their metrics.
    *   Verify that charts update in real-time during a running simulation.
    *   Automated UI tests to verify chart rendering and data accuracy.
*   **Metrics/Checkpoints:** Charts render correctly; data points align with simulation events.
*   **Expected Output/Review Checklist:**
    *   Metrics charts are clear and readable.
    *   Data displayed in charts matches the raw data from the Observability Data Service.
    *   Dashboard is responsive and interactive.

### 3.4. Frontend UI for Basic Trace Visualization Verification

*   **Test Specs:**
    *   Manual testing: Select a request and view its trace.
    *   Verify that the trace shows the correct sequence of spans and their durations.
    *   Automated UI tests to verify trace rendering.
*   **Metrics/Checkpoints:** Traces load quickly; span details are accurate.
*   **Expected Output/Review Checklist:**
    *   Trace visualization clearly shows the path of a request through the system.
    *   Latency breakdowns for each span are correct.

---

**Author:** Manus AI

**Date:** 2025-07-19


