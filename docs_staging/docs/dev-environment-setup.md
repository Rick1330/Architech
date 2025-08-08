# Development Environment Setup: Architech

## 1. Introduction

This document provides instructions for setting up a local development environment for Architech. A consistent and well-configured development environment is crucial for efficient development, testing, and collaboration. These instructions are tailored for a typical Unix-like environment (Linux, macOS) and assume basic familiarity with command-line operations.

## 2. Prerequisites

Before you begin, ensure you have the following software installed on your system:

*   **Git:** For version control.
    *   [Download Git](https://git-scm.com/downloads)
*   **Docker & Docker Compose:** For containerizing and orchestrating services.
    *   [Install Docker Engine](https://docs.docker.com/engine/install/)
    *   [Install Docker Compose](https://docs.docker.com/compose/install/)
*   **Node.js (LTS) & npm/yarn:** For frontend development.
    *   [Download Node.js](https://nodejs.org/en/download/)
*   **Python 3.9+ & pip:** For backend services and AI components.
    *   [Download Python](https://www.python.org/downloads/)
*   **Go (latest stable version):** For the Simulation Engine (if implemented in Go).
    *   [Download Go](https://golang.org/dl/)
*   **Text Editor/IDE:** (e.g., VS Code, IntelliJ IDEA, Sublime Text) with relevant extensions for JavaScript/TypeScript, Python, Go, and Markdown.

## 3. Getting Started

Follow these steps to set up your local development environment:

### 3.1. Clone the Repository

First, clone the Architech monorepo from GitHub:

```bash
git clone https://github.com/architech/architech.git
cd architech
```

### 3.2. Environment Configuration

Architech uses environment variables for configuration. Create a `.env` file in the root directory of the cloned repository. A `.env.example` file will be provided with default values. Copy it and adjust as needed:

```bash
cp .env.example .env
```

Review the `.env` file and update any necessary variables, such as database connection strings, API keys, or service ports.

### 3.3. Backend Services Setup

Navigate to the `backend/` directory and install Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### 3.4. Frontend Setup

Navigate to the `frontend/` directory and install Node.js dependencies:

```bash
cd frontend
npm install # or yarn install
```

### 3.5. Simulation Engine Setup (if applicable)

If the simulation engine is a separate Go module, navigate to its directory (e.g., `simulation-engine/`) and install Go modules:

```bash
cd simulation-engine
go mod tidy
```

## 4. Running Services with Docker Compose

Architech utilizes Docker Compose to orchestrate and run all services (backend, database, message queue, etc.) in isolated containers. This provides a consistent and reproducible development environment.

From the root directory of the `architech` repository, run:

```bash
docker-compose up --build
```

This command will:

*   Build Docker images for each service (if not already built).
*   Start all defined services (e.g., PostgreSQL, RabbitMQ, Backend API, Frontend).
*   Map container ports to your local machine (e.g., frontend accessible at `http://localhost:3000`, backend API at `http://localhost:8080`).

To run services in detached mode (in the background):

```bash
docker-compose up -d --build
```

To stop all services:

```bash
docker-compose down
```

## 5. Running Services Locally (without Docker Compose)

For faster iteration on specific services, you can run them locally outside of Docker Compose. Ensure all dependent services (e.g., database, message queue) are running via Docker Compose or separately.

### 5.1. Running Backend Services Locally

From the `backend/` directory:

```bash
python app.py # or equivalent command for your backend framework
```

### 5.2. Running Frontend Locally

From the `frontend/` directory:

```bash
npm start # or yarn start
```

### 5.3. Running Simulation Engine Locally

From the `simulation-engine/` directory:

```bash
go run main.go # or equivalent command
```

## 6. Database Migrations

If there are database schema changes, you will need to run migrations. Instructions will vary based on the database and ORM/migration tool used (e.g., Alembic for SQLAlchemy, Flyway for Java).

Example (Python/Alembic):

```bash
cd backend
alembic upgrade head
```

## 7. Testing

Run unit and integration tests for each service:

```bash
# For backend
cd backend
pytest

# For frontend
cd frontend
npm test # or yarn test
```

## 8. Troubleshooting

*   **Port Conflicts:** If `docker-compose up` fails due to port conflicts, ensure no other applications are using the required ports (e.g., 3000, 8080, 5432).
*   **Docker Issues:** If Docker containers fail to start, check Docker logs (`docker logs <container_name>`) for specific error messages.
*   **Dependency Issues:** Ensure all prerequisites are installed and environment variables are correctly configured.

For further assistance, refer to the `CONTRIBUTING.md` or `maintainer-notes.md` documents.

---

**Author:** Manus AI

**Date:** 2025-07-17


