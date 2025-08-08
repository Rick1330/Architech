# Phase 2: Design Management & Persistence

## Goal
Implement the ability to create, store, and retrieve system designs, including components and connections.

## 1. WHAT TO BUILD

### 1.1. Design Service Implementation

*   **Description:** Develop the Design Service, responsible for managing system designs, their components, and connections. This will be a Python FastAPI application, similar to the User and Project services.
*   **Files to be created:**
    *   `./services/design-service/Dockerfile`: Dockerfile for building the Design Service image.
    *   `./services/design-service/requirements.txt`: Python dependencies.
    *   `./services/design-service/main.py`: FastAPI application entry point.
    *   `./services/design-service/app/api/v1/endpoints/designs.py`: Design-related API endpoints (CRUD for designs, components, connections).
    *   `./services/design-service/app/core/config.py`: Application configuration settings.
    *   `./services/design-service/app/db/database.py`: Database connection and session management.
    *   `./services/design-service/app/db/models.py`: SQLAlchemy models for `Design`, `Component`, and `Connection` entities.
    *   `./services/design-service/app/schemas/design.py`: Pydantic schemas for `Design` request/response validation.
    *   `./services/design-service/app/schemas/component.py`: Pydantic schemas for `Component` request/response validation.
    *   `./services/design-service/app/schemas/connection.py`: Pydantic schemas for `Connection` request/response validation.
    *   `./services/design-service/app/crud/design.py`: CRUD operations for `Design` model.
    *   `./services/design-service/app/crud/component.py`: CRUD operations for `Component` model.
    *   `./services/design-service/app/crud/connection.py`: CRUD operations for `Connection` model.
    *   `./services/design-service/tests/test_designs.py`: Unit and integration tests for Design Service.
*   **File Locations:** `./services/design-service/`
*   **Component Interaction:** Exposes RESTful API endpoints for design management. Interacts with PostgreSQL for data persistence. Designs will be linked to projects via `project_id`.

### 1.2. Integration with Project Service

*   **Description:** Modify the Project Service to include a relationship with designs, allowing projects to own multiple designs. This involves updating the Project model and potentially adding API endpoints to list designs within a project.
*   **Files to be modified:**
    *   `./services/project-service/app/db/models.py`: Add relationship to `Design` model.
    *   `./services/project-service/app/schemas/project.py`: Update schema to include nested designs (optional, for listing).
    *   `./services/project-service/app/api/v1/endpoints/projects.py`: Potentially add endpoint to retrieve designs by project ID.
*   **File Locations:** `./services/project-service/`
*   **Component Interaction:** Project Service will query Design Service to retrieve associated designs. This interaction will likely happen through the API Gateway or direct service-to-service communication if within the same network.

### 1.3. Version Control for Designs (Initial Implementation)

*   **Description:** Implement a basic versioning mechanism for designs within the Design Service. This could involve storing snapshots of designs or maintaining a simple version history.
*   **Files to be modified/created:**
    *   `./services/design-service/app/db/models.py`: Add `version` field to `Design` model and potentially a `is_latest` flag.
    *   `./services/design-service/app/crud/design.py`: Logic for creating new versions and marking previous versions as non-latest.
    *   `./services/design-service/app/api/v1/endpoints/designs.py`: API endpoint for creating new versions of a design.
*   **File Locations:** `./services/design-service/`
*   **Component Interaction:** The Design Service will manage the versioning logic internally. Frontend will interact with specific version endpoints.

### 1.4. API Endpoints for Design Management

*   **Description:** Ensure comprehensive API endpoints are available for all CRUD operations related to designs, components, and connections.
*   **Files to be modified:**
    *   `./services/design-service/app/api/v1/endpoints/designs.py`: Ensure endpoints for:
        *   `POST /designs`: Create a new design.
        *   `GET /designs/{design_id}`: Retrieve a specific design with its components and connections.
        *   `PUT /designs/{design_id}`: Update an existing design.
        *   `DELETE /designs/{design_id}`: Delete a design.
        *   `POST /designs/{design_id}/components`: Add a component to a design.
        *   `PUT /designs/{design_id}/components/{component_id}`: Update a component.
        *   `DELETE /designs/{design_id}/components/{component_id}`: Delete a component.
        *   Similar endpoints for connections.
        *   `POST /designs/{design_id}/versions`: Create a new version of a design.
*   **File Locations:** `./services/design-service/app/api/v1/endpoints/`
*   **Component Interaction:** These endpoints will be consumed by the Frontend application and potentially other internal services.

## 2. WHO BUILDS IT

*   **Manus:**
    *   Defines the database schema for `Design`, `Component`, and `Connection` entities.
    *   Scaffolds the `design-service` directory and initial file structure.
    *   Provides guidance on the versioning strategy for designs.
*   **Cursor:**
    *   Implements the detailed logic within `main.py`, `endpoints/`, `db/`, `schemas/`, and `crud/` for the Design Service.
    *   Writes comprehensive unit and integration tests for all Design Service functionalities.
    *   Implements the necessary modifications in the Project Service for design integration.
*   **Human Dev Team (Oversight):**
    *   Reviews the database schema and API contracts for the Design Service.
    *   Validates the versioning approach.
    *   Ensures proper authentication and authorization are considered for design access.

## 3. HOW TO VERIFY

### 3.1. Design Service Implementation Verification

*   **Test Specs:**
    *   Run unit tests (`pytest services/design-service/tests/`).
    *   Run integration tests covering:
        *   Creating a new design with multiple components and connections.
        *   Retrieving a design and verifying its structure.
        *   Updating component properties and connection details.
        *   Deleting components, connections, and entire designs.
        *   Creating new versions of a design and verifying `is_latest` flag.
*   **Metrics/Checkpoints:**
    *   All unit and integration tests pass.
    *   API response times for CRUD operations < 75ms (due to potentially larger payloads).
    *   Test coverage for `design-service` > 90%.
*   **Expected Output/Review Checklist:**
    *   `pytest` output shows 100% pass rate.
    *   API calls via `curl` or Postman return expected JSON responses, including nested components and connections.
    *   Database records accurately reflect the state of designs, components, and connections.

### 3.2. Integration with Project Service Verification

*   **Test Specs:**
    *   Create a user and a project via their respective services.
    *   Create multiple designs and associate them with the created project via the Design Service.
    *   Retrieve the project and verify that associated designs can be listed (if such an endpoint is implemented).
*   **Metrics/Checkpoints:** Successful association and retrieval of designs by project.
*   **Expected Output/Review Checklist:**
    *   API calls demonstrate correct linking between projects and designs.
    *   No data integrity issues observed when linking entities.

### 3.3. Version Control for Designs Verification

*   **Test Specs:**
    *   Create an initial design.
    *   Make modifications to the design and create a new version.
    *   Verify that the previous version is marked as `is_latest=false` and the new version as `is_latest=true`.
    *   Retrieve both versions of the design and confirm their content.
*   **Metrics/Checkpoints:** Versioning logic functions as expected.
*   **Expected Output/Review Checklist:**
    *   Database queries confirm correct versioning flags.
    *   API calls for specific design versions return the expected content.

### 3.4. API Endpoints for Design Management Verification

*   **Test Specs:**
    *   Execute all defined API endpoints for designs, components, and connections with valid and invalid payloads.
    *   Test edge cases (e.g., deleting a component that doesn't exist, updating a connection with invalid IDs).
*   **Metrics/Checkpoints:** All API endpoints return correct status codes and responses.
*   **Expected Output/Review Checklist:**
    *   API documentation (e.g., Swagger UI) accurately reflects all endpoints.
    *   Automated API tests (e.g., Postman collections, custom scripts) pass.

---

**Author:** Manus AI

**Date:** 2025-07-19


