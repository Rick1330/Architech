# Phase 3: Core Simulation Engine

## Goal
Develop the foundational discrete-event simulation engine capable of processing events and modeling basic component behaviors.

## 1. WHAT TO BUILD

### 1.1. Simulation Engine Core

*   **Description:** Implement the core discrete-event simulation (DES) engine, including the event queue and the simulation clock. This will be a high-performance component, potentially written in Go or a performant Python framework.
*   **Files to be created:**
    *   `./simulation-engine/main.go` (or `main.py` if Python): Entry point for the simulation engine.
    *   `./simulation-engine/pkg/engine/engine.go`: Core simulation loop, event queue management, simulation clock.
    *   `./simulation-engine/pkg/engine/event.go`: Definition of the `Event` struct/class.
    *   `./simulation-engine/pkg/engine/priority_queue.go`: Implementation of a min-heap based priority queue for events.
    *   `./simulation-engine/pkg/model/request.go`: Definition of the `Request` struct/class.
    *   `./simulation-engine/pkg/model/component.go`: Base interface/abstract class for all simulated components.
    *   `./simulation-engine/tests/engine_test.go`: Unit tests for the core engine logic and event queue.
*   **File Locations:** `./simulation-engine/`
*   **Component Interaction:** The simulation engine will be a standalone service that receives simulation configurations and emits events. It will not directly interact with databases in this phase but will emit events to a message queue.

### 1.2. Abstract Component and Event Models

*   **Description:** Define the fundamental interfaces and abstract classes for components and events within the simulation engine. This ensures extensibility and a consistent way to interact with different component types.
*   **Files to be created/modified:**
    *   `./simulation-engine/pkg/model/component.go`: (Refine) Define `Component` interface with methods like `HandleEvent(event Event) ([]Event, error)`.
    *   `./simulation-engine/pkg/model/event.go`: (Refine) Define `Event` struct with `Timestamp`, `Type`, `Data` fields.
    *   `./simulation-engine/pkg/model/properties.go`: Common properties for components (e.g., `ProcessingTime`, `Capacity`).
*   **File Locations:** `./simulation-engine/pkg/model/`
*   **Component Interaction:** These models serve as contracts for implementing concrete component behaviors.

### 1.3. Basic Component Implementations

*   **Description:** Implement initial concrete component types that model basic behaviors of distributed systems.
*   **Files to be created:**
    *   `./simulation-engine/pkg/components/generic_service.go`: Implements `Component` interface for a generic service with processing time.
    *   `./simulation-engine/pkg/components/database.go`: Implements `Component` interface for a database with read/write latencies.
    *   `./simulation-engine/pkg/components/message_queue.go`: Implements `Component` interface for a message queue with enqueue/dequeue logic and capacity.
    *   `./simulation-engine/tests/components_test.go`: Unit tests for each basic component type.
*   **File Locations:** `./simulation-engine/pkg/components/`
*   **Component Interaction:** These components will interact by generating new events (e.g., a `GenericService` completing processing generates a `RequestProcessed` event) and sending them back to the engine to be added to the event queue.

### 1.4. Event Emission Mechanism

*   **Description:** Implement a mechanism for the simulation engine to emit detailed simulation events (e.g., request arrivals, processing completions, component state changes) to a message queue (e.g., Kafka).
*   **Files to be created:**
    *   `./simulation-engine/pkg/publisher/kafka_publisher.go`: Kafka client for publishing events.
    *   `./simulation-engine/pkg/publisher/publisher.go`: Interface for event publishers.
    *   `./simulation-engine/pkg/engine/engine.go`: (Modify) Integrate event publisher into the main simulation loop.
    *   `./simulation-engine/tests/publisher_test.go`: Unit tests for the event publisher.
*   **File Locations:** `./simulation-engine/pkg/publisher/`
*   **Component Interaction:** The simulation engine will be the producer of these events. The Observability Data Service (Phase 6) will be the consumer.

## 2. WHO BUILDS IT

*   **Manus:**
    *   Defines the overall architecture of the simulation engine.
    *   Scaffolds the `simulation-engine` directory and initial Go/Python project structure.
    *   Implements the core `engine.go` (or `engine.py`) including the event queue and simulation clock.
    *   Defines the `Component` and `Event` interfaces/abstract classes.
    *   Sets up the event emission mechanism to Kafka.
*   **Cursor:**
    *   Implements the concrete `GenericService`, `Database`, and `MessageQueue` components.
    *   Writes comprehensive unit tests for the engine core, event queue, and all basic components.
    *   Assists in optimizing the performance of the event queue and event processing logic.
*   **Human Dev Team (Oversight):**
    *   Reviews the simulation engine architecture and core algorithms.
    *   Validates the realism and accuracy of basic component behaviors.
    *   Provides input on performance targets and potential optimizations.

## 3. HOW TO VERIFY

### 3.1. Simulation Engine Core Verification

*   **Test Specs:**
    *   Unit tests for `priority_queue.go` (or equivalent) to ensure correct event ordering.
    *   Unit tests for `engine.go` to verify event processing loop and simulation clock advancement.
    *   Simple end-to-end simulation tests with a few events to ensure the engine runs without errors.
*   **Metrics/Checkpoints:**
    *   Event queue operations (insert, extract) perform within expected time complexity (e.g., O(log n)).
    *   Simulation completes successfully for basic scenarios.
*   **Expected Output/Review Checklist:**
    *   All unit tests pass.
    *   Simulation logs show correct event order and timestamps.

### 3.2. Basic Component Implementations Verification

*   **Test Specs:**
    *   Unit tests for `generic_service.go`, `database.go`, `message_queue.go` to verify their `HandleEvent` logic and state transitions.
    *   Integration tests where a `GenericService` sends requests to a `Database` or `MessageQueue` and verifies the resulting events.
*   **Metrics/Checkpoints:**
    *   Components correctly process events and generate new events as expected.
    *   Simulated latencies and processing times are accurate.
*   **Expected Output/Review Checklist:**
    *   All component unit tests pass.
    *   Simulation logs show correct behavior for each component (e.g., database read/write events, message queue enqueue/dequeue).

### 3.3. Event Emission Mechanism Verification

*   **Test Specs:**
    *   Unit tests for `kafka_publisher.go` (or equivalent) to ensure messages are correctly formatted and sent to Kafka.
    *   Integration test where the simulation engine runs a small simulation and a separate consumer verifies that all expected events are received in the Kafka topic.
*   **Metrics/Checkpoints:**
    *   Events are published to Kafka without loss.
    *   Event payload structure is consistent.
*   **Expected Output/Review Checklist:**
    *   All publisher unit tests pass.
    *   Kafka consumer receives all simulation events in the correct order.
    *   No errors in simulation engine logs related to event publishing.

---

**Author:** Manus AI

**Date:** 2025-07-19


