# Phase 1: Foundational Setup & Core Services

## Goal
Establish the basic project structure, set up core infrastructure (database, message queue), and implement foundational services for user and project management.

## 1. WHAT TO BUILD

### 1.1. Project Repository Setup

*   **Description:** Initialize the main Architech monorepo, including essential top-level files.
*   **Files to be created:**
    *   `./README.md`: High-level project overview, quick start guide.
    *   `./CONTRIBUTING.md`: Guidelines for contributing to the project (already created in previous task, ensure it's up-to-date).
    *   `./CODE_OF_CONDUCT.md`: Community code of conduct (already created in previous task, ensure it's up-to-date).
    *   `./LICENSE.md`: Project licensing information (already created in previous task, ensure it's up-to-date).
    *   `./.gitignore`: Standard Git ignore file for common development artifacts.
    *   `./.editorconfig`: Ensures consistent coding styles across different editors.
    *   `./.github/workflows/ci.yml`: Initial CI workflow definition for linting and testing.
*   **File Locations:** Root of the project directory.
*   **Component Interaction:** These are foundational files; they do not directly interact with other components but define the project's structure and development guidelines.

### 1.2. Docker-Compose Setup for Local Development

*   **Description:** Configure a `docker-compose.yml` file to orchestrate local development services, including PostgreSQL for relational data, Redis for caching/session management, and Kafka (or RabbitMQ) for inter-service communication.
*   **Files to be created:**
    *   `./docker-compose.yml`: Defines services, networks, and volumes for local development.
    *   `./.env.example`: Example environment variables for Docker-Compose services.
*   **File Locations:** Root of the project directory.
*   **Component Interaction:**
    *   **PostgreSQL:** Used by User Service, Project Service, Design Service, Simulation Orchestration Service, and Observability Data Service for persistent storage.
    *   **Redis:** Used by various services for caching, session management, and potentially rate limiting.
    *   **Kafka/RabbitMQ:** Used as a message bus for asynchronous communication between microservices (e.g., simulation events, notifications).

### 1.3. User Service Implementation

*   **Description:** Develop the User Service, responsible for user authentication, authorization, and profile management. This will be a Python FastAPI application.
*   **Files to be created:**
    *   `./services/user-service/Dockerfile`: Dockerfile for building the User Service image.
    *   `./services/user-service/requirements.txt`: Python dependencies.
    *   `./services/user-service/main.py`: FastAPI application entry point.
    *   `./services/user-service/app/api/v1/endpoints/users.py`: User-related API endpoints (CRUD).
    *   `./services/user-service/app/core/config.py`: Application configuration settings.
    *   `./services/user-service/app/db/database.py`: Database connection and session management.
    *   `./services/user-service/app/db/models.py`: SQLAlchemy models for User entity.
    *   `./services/user-service/app/schemas/user.py`: Pydantic schemas for request/response validation.
    *   `./services/user-service/app/crud/user.py`: CRUD operations for User model.
    *   `./services/user-service/app/security/password.py`: Password hashing utilities.
    *   `./services/user-service/tests/test_users.py`: Unit and integration tests for User Service.
*   **File Locations:** `./services/user-service/`
*   **Component Interaction:** Exposes RESTful API endpoints for user management. Interacts with PostgreSQL for data persistence.

### 1.4. Project Service Implementation

*   **Description:** Develop the Project Service, responsible for managing user-created projects. This will also be a Python FastAPI application.
*   **Files to be created:**
    *   `./services/project-service/Dockerfile`: Dockerfile for building the Project Service image.
    *   `./services/project-service/requirements.txt`: Python dependencies.
    *   `./services/project-service/main.py`: FastAPI application entry point.
    *   `./services/project-service/app/api/v1/endpoints/projects.py`: Project-related API endpoints (CRUD).
    *   `./services/project-service/app/core/config.py`: Application configuration settings.
    *   `./services/project-service/app/db/database.py`: Database connection and session management.
    *   `./services/project-service/app/db/models.py`: SQLAlchemy models for Project entity.
    *   `./services/project-service/app/schemas/project.py`: Pydantic schemas for request/response validation.
    *   `./services/project-service/app/crud/project.py`: CRUD operations for Project model.
    *   `./services/project-service/tests/test_projects.py`: Unit and integration tests for Project Service.
*   **File Locations:** `./services/project-service/`
*   **Component Interaction:** Exposes RESTful API endpoints for project management. Interacts with PostgreSQL for data persistence. May interact with User Service for user validation (via API Gateway).

### 1.5. Initial CI/CD Pipeline

*   **Description:** Set up a basic GitHub Actions workflow to lint, test, and build Docker images for the User and Project services on push to `main` and pull requests.
*   **Files to be created/modified:**
    *   `./.github/workflows/ci.yml`: (Update existing) Add jobs for User and Project services.
*   **File Locations:** `./.github/workflows/`
*   **Component Interaction:** Triggers builds and tests for `user-service` and `project-service` directories. Pushes Docker images to a container registry (e.g., GitHub Container Registry).

## 2. WHO BUILDS IT

*   **Manus:**
    *   Orchestrates the creation of the overall directory structure.
    *   Generates `docker-compose.yml` and `.env.example`.
    *   Scaffolds the basic directory and file structure for `user-service` and `project-service`.
    *   Sets up the initial `ci.yml` workflow.
*   **Cursor:**
    *   Implements the detailed logic within `main.py`, `endpoints/`, `db/`, `schemas/`, `crud/`, and `security/` for both User and Project services.
    *   Writes comprehensive unit and integration tests (`tests/`).
    *   Refines `.gitignore` and `.editorconfig`.
*   **Human Dev Team (Oversight):**
    *   Reviews generated code and configurations for correctness, security, and best practices.
    *   Provides specific requirements for API contracts and data models.
    *   Performs manual smoke tests of the local Docker-Compose setup.

## 3. HOW TO VERIFY

### 3.1. Project Repository Setup Verification

*   **Test Specs:**
    *   Verify the existence of all specified top-level files (`README.md`, `.gitignore`, etc.).
    *   Check `.editorconfig` for correct formatting rules.
    *   Validate `ci.yml` syntax and basic workflow structure.
*   **Metrics/Checkpoints:** All files present and correctly formatted.
*   **Expected Output/Review Checklist:**
    *   `ls -a` in root shows all expected files.
    *   `git status` shows a clean working directory after initial commit.
    *   GitHub Actions workflow for `ci.yml` runs successfully on initial push.

### 3.2. Docker-Compose Setup Verification

*   **Test Specs:**
    *   Run `docker-compose up --build -d`.
    *   Verify all services (PostgreSQL, Redis, Kafka/RabbitMQ) are running and healthy.
    *   Connect to PostgreSQL using a client (e.g., `psql`) and verify database creation.
    *   Connect to Redis using `redis-cli` and perform a simple `PING`.
*   **Metrics/Checkpoints:** All containers `Up` and `healthy`.
*   **Expected Output/Review Checklist:**
    *   `docker-compose ps` shows all services in `Up` state.
    *   `docker logs <service_name>` shows no critical errors during startup.
    *   Successful connection to databases/message queues from local machine.

### 3.3. User Service Implementation Verification

*   **Test Specs:**
    *   Run unit tests (`pytest services/user-service/tests/`).
    *   Run integration tests (e.g., create user via API, retrieve user, update user, delete user).
    *   Test password hashing and verification.
*   **Metrics/Checkpoints:**
    *   All unit and integration tests pass.
    *   API response times for CRUD operations < 50ms.
    *   Test coverage for `user-service` > 90%.
*   **Expected Output/Review Checklist:**
    *   `pytest` output shows 100% pass rate.
    *   API calls via `curl` or Postman return expected JSON responses.
    *   Database records reflect changes made via API.

### 3.4. Project Service Implementation Verification

*   **Test Specs:**
    *   Run unit tests (`pytest services/project-service/tests/`).
    *   Run integration tests (e.g., create project, retrieve project by user, update project, delete project).
*   **Metrics/Checkpoints:**
    *   All unit and integration tests pass.
    *   API response times for CRUD operations < 50ms.
    *   Test coverage for `project-service` > 90%.
*   **Expected Output/Review Checklist:**
    *   `pytest` output shows 100% pass rate.
    *   API calls via `curl` or Postman return expected JSON responses.
    *   Database records reflect changes made via API.

### 3.5. Initial CI/CD Pipeline Verification

*   **Test Specs:**
    *   Push a small change to `main` branch.
    *   Create a pull request with a small change.
*   **Metrics/Checkpoints:**
    *   CI workflow completes successfully on push/PR.
    *   Linting and testing steps pass.
    *   Docker images are successfully built and tagged.
*   **Expected Output/Review Checklist:**
    *   GitHub Actions UI shows green checks for all jobs.
    *   Container registry shows new image tags for `user-service` and `project-service`.

---

**Author:** Manus AI

**Date:** 2025-07-19


