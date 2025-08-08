# Phase 7: Fault Injection & Resilience Patterns

## Goal
Implement advanced fault injection capabilities and allow users to configure resilience patterns within their designs.

## 1. WHAT TO BUILD

### 1.1. Simulation Engine Extensions for Fault Injection

*   **Description:** Extend the core Simulation Engine to support various types of fault injection, allowing components to fail or behave abnormally under specific conditions.
*   **Files to be created/modified:**
    *   `./simulation-engine/pkg/engine/engine.go`: (Modify) Integrate fault injection logic into the event processing loop.
    *   `./simulation-engine/pkg/faults/fault_injector.go`: Interface for fault injectors.
    *   `./simulation-engine/pkg/faults/component_crash.go`: Implements `FaultInjector` for component crashes.
    *   `./simulation-engine/pkg/faults/network_latency.go`: Implements `FaultInjector` for injecting network latency.
    *   `./simulation-engine/pkg/faults/resource_exhaustion.go`: Implements `FaultInjector` for simulating resource exhaustion.
    *   `./simulation-engine/pkg/model/fault_config.go`: Data structure for fault injection configurations.
    *   `./simulation-engine/tests/fault_injection_test.go`: Unit and integration tests for fault injectors.
*   **File Locations:** `./simulation-engine/pkg/faults/`, `./simulation-engine/pkg/model/`
*   **Component Interaction:** The Simulation Engine will receive fault configurations as part of the simulation setup. Fault injectors will modify component behavior or introduce delays/failures during event processing.

### 1.2. Design Service Extensions for Fault Injection Configuration

*   **Description:** Extend the Design Service to store fault injection configurations as part of a system design, allowing users to define chaos engineering experiments.
*   **Files to be modified:**
    *   `./services/design-service/app/db/models.py`: Add models for `FaultInjectionConfig` and link to `Design`.
    *   `./services/design-service/app/schemas/design.py`: (Modify) Include `FaultInjectionConfig` in design schema.
    *   `./services/design-service/app/api/v1/endpoints/designs.py`: (Modify) Add endpoints for managing fault injection configurations within a design.
*   **File Locations:** `./services/design-service/`
*   **Component Interaction:** The Design Service will persist and retrieve fault injection configurations. The Simulation Orchestration Service will fetch these configurations when starting a simulation.

### 1.3. Simulation Engine Extensions for Resilience Patterns

*   **Description:** Extend the Simulation Engine to model common resilience patterns (e.g., Circuit Breaker, Retry, Bulkhead) and apply them to components during simulation.
*   **Files to be created/modified:**
    *   `./simulation-engine/pkg/engine/engine.go`: (Modify) Integrate resilience pattern application logic.
    *   `./simulation-engine/pkg/resilience/circuit_breaker.go`: Implements Circuit Breaker logic.
    *   `./simulation-engine/pkg/resilience/retry.go`: Implements Retry logic.
    *   `./simulation-engine/pkg/resilience/bulkhead.go`: Implements Bulkhead logic.
    *   `./simulation-engine/pkg/model/resilience_config.go`: Data structure for resilience pattern configurations.
    *   `./simulation-engine/pkg/components/component_wrapper.go`: Wrapper to apply resilience patterns to components.
    *   `./simulation-engine/tests/resilience_test.go`: Unit and integration tests for resilience patterns.
*   **File Locations:** `./simulation-engine/pkg/resilience/`, `./simulation-engine/pkg/model/`
*   **Component Interaction:** Resilience patterns will intercept events and modify their flow or outcome based on configured rules, simulating real-world resilience mechanisms.

### 1.4. Design Service Extensions for Resilience Pattern Configuration

*   **Description:** Extend the Design Service to store resilience pattern configurations as part of a system design, allowing users to define and test their system's resilience.
*   **Files to be modified:**
    *   `./services/design-service/app/db/models.py`: Add models for `ResilienceConfig` and link to `Component`.
    *   `./services/design-service/app/schemas/component.py`: (Modify) Include `ResilienceConfig` in component schema.
    *   `./services/design-service/app/api/v1/endpoints/designs.py`: (Modify) Add endpoints for managing resilience configurations for components.
*   **File Locations:** `./services/design-service/`
*   **Component Interaction:** The Design Service will persist and retrieve resilience configurations. The Simulation Orchestration Service will fetch these configurations and pass them to the Simulation Engine.

### 1.5. Frontend UI for Fault Injection Configuration

*   **Description:** Add UI elements to the frontend for defining and configuring fault injection scenarios within a design.
*   **Files to be created/modified:**
    *   `./frontend/src/components/FaultInjection/FaultInjectionPanel.js`: UI for selecting fault types and configuring parameters.
    *   `./frontend/src/components/FaultInjection/ComponentCrashForm.js`: Form for configuring component crash faults.
    *   `./frontend/src/components/FaultInjection/NetworkLatencyForm.js`: Form for configuring network latency faults.
    *   `./frontend/src/views/DesignEditorPage.js`: (Modify) Integrate `FaultInjectionPanel`.
    *   `./frontend/src/store/designSlice.js`: (Modify) Add actions for updating fault injection configurations via Design Service API.
*   **File Locations:** `./frontend/src/components/FaultInjection/`, `./frontend/src/views/`, `./frontend/src/store/`
*   **Component Interaction:** Users configure faults in the UI, which are then saved to the Design Service.

### 1.6. Frontend UI for Resilience Pattern Configuration

*   **Description:** Add UI elements to the frontend for configuring resilience patterns on individual components within a design.
*   **Files to be created/modified:**
    *   `./frontend/src/components/Resilience/ResiliencePanel.js`: UI for selecting resilience patterns and configuring parameters.
    *   `./frontend/src/components/Resilience/CircuitBreakerForm.js`: Form for configuring Circuit Breaker.
    *   `./frontend/src/components/Resilience/RetryForm.js`: Form for configuring Retry.
    *   `./frontend/src/components/PropertyPanel/ComponentProperties.js`: (Modify) Integrate `ResiliencePanel` into component property view.
    *   `./frontend/src/store/designSlice.js`: (Modify) Add actions for updating resilience configurations via Design Service API.
*   **File Locations:** `./frontend/src/components/Resilience/`, `./frontend/src/components/PropertyPanel/`, `./frontend/src/store/`
*   **Component Interaction:** Users configure resilience patterns in the UI, which are then saved to the Design Service.

## 2. WHO BUILDS IT

*   **Manus:**
    *   Defines the interfaces and core logic for fault injectors and resilience patterns within the Simulation Engine.
    *   Provides guidance on how fault injection and resilience patterns should interact with the core simulation loop.
    *   Defines the data models for fault and resilience configurations in the Design Service.
*   **Cursor:**
    *   Implements the concrete fault injector types (`component_crash.go`, `network_latency.go`, etc.).
    *   Implements the concrete resilience pattern logic (`circuit_breaker.go`, `retry.go`, etc.).
    *   Develops the necessary extensions in the Design Service for storing fault and resilience configurations.
    *   Implements the frontend logic for interacting with the fault injection and resilience APIs.
    *   Writes comprehensive unit and integration tests for all fault injection and resilience features.
*   **Lovable/MGX.dev:**
    *   Designs and implements the UI components for fault injection (`FaultInjectionPanel`, forms) and resilience pattern configuration (`ResiliencePanel`, forms).
    *   Ensures the UI is intuitive and provides clear feedback on configuration options.
*   **Human Dev Team (Oversight):**
    *   Reviews the realism and accuracy of the fault injection and resilience models.
    *   Provides input on the types of faults and resilience patterns that are most relevant to users.
    *   Conducts chaos engineering experiments within the simulated environment to validate the features.

## 3. HOW TO VERIFY

### 3.1. Simulation Engine Fault Injection Verification

*   **Test Specs:**
    *   Unit tests for each fault injector to verify its specific behavior (e.g., `component_crash` stops processing, `network_latency` adds delay).
    *   Integration tests: Run a simulation with fault injection enabled and verify that the simulation results (logs, metrics) reflect the injected faults.
*   **Metrics/Checkpoints:**
    *   Faults are injected at the specified times/conditions.
    *   Simulation behavior changes as expected due to faults.
*   **Expected Output/Review Checklist:**
    *   Simulation logs clearly show fault injection events.
    *   Metrics (e.g., error rates, latency) increase when faults are active.

### 3.2. Simulation Engine Resilience Patterns Verification

*   **Test Specs:**
    *   Unit tests for each resilience pattern to verify its logic (e.g., `circuit_breaker` opens after failures, `retry` attempts re-execution).
    *   Integration tests: Run a simulation with both faults and resilience patterns enabled. Verify that resilience patterns mitigate the impact of faults as expected.
*   **Metrics/Checkpoints:**
    *   Resilience patterns activate under stress conditions.
    *   System performance degrades gracefully or recovers as designed.
*   **Expected Output/Review Checklist:**
    *   Simulation logs show resilience pattern activation (e.g., circuit breaker opening/closing).
    *   Metrics demonstrate improved stability compared to simulations without resilience.

### 3.3. Design Service Extensions Verification

*   **Test Specs:**
    *   API integration tests for saving and retrieving designs with fault injection and resilience configurations.
    *   Verify that the database correctly stores the complex nested configurations.
*   **Metrics/Checkpoints:** Configurations are persisted accurately.
*   **Expected Output/Review Checklist:**
    *   API calls return correct fault and resilience configurations.
    *   Database schema supports the new configuration models.

### 3.4. Frontend UI for Fault Injection Configuration Verification

*   **Test Specs:**
    *   Manual testing: Configure various fault types and parameters in the UI.
    *   Verify that the UI correctly displays the saved configurations after reloading the design.
    *   Automated UI tests to ensure forms are interactive and data is correctly bound.
*   **Metrics/Checkpoints:** UI is responsive; configurations are saved and loaded correctly.
*   **Expected Output/Review Checklist:**
    *   Fault configuration forms are intuitive and easy to use.
    *   Changes made in the UI are reflected in the backend.

### 3.5. Frontend UI for Resilience Pattern Configuration Verification

*   **Test Specs:**
    *   Manual testing: Apply different resilience patterns to components and configure their parameters.
    *   Verify that the UI correctly displays the saved configurations.
    *   Automated UI tests to ensure forms are interactive and data is correctly bound.
*   **Metrics/Checkpoints:** UI is responsive; configurations are saved and loaded correctly.
*   **Expected Output/Review Checklist:**
    *   Resilience configuration forms are intuitive.
    *   Changes made in the UI are reflected in the backend.

---

**Author:** Manus AI

**Date:** 2025-07-19


