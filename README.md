# Architech: Distributed Systems Design Simulation Studio

Architech is a powerful platform for designing, simulating, and analyzing distributed systems. It allows users to model complex architectures, inject faults, and observe system behavior under various conditions, providing insights into resilience, performance, and scalability.

## Project Structure

*   `services/`: Contains all backend microservices (User, Project, Design, Simulation Orchestration, AI, Observability Data).
*   `frontend/`: Contains the React-based frontend application.
*   `infrastructure/`: Contains Infrastructure as Code (IaC) for cloud deployments (Terraform, Kubernetes manifests).
*   `e2e-tests/`: Contains end-to-end tests for the entire system.
*   `helm/`: Contains Helm charts for Kubernetes deployments.
*   `docs/`: Comprehensive project documentation (moved from previous task).
*   `development_plan/`: Detailed development plan and AI guidance (moved from previous task).

## Getting Started (Local Development)

To set up the project for local development, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd architech
    ```

2.  **Set up Docker Compose:**
    Ensure Docker Desktop (or Docker Engine) is installed and running on your system. The `docker-compose.yml` file in the root directory defines the local development environment.

3.  **Build and run services:**
    ```bash
    docker-compose up --build
    ```
    This command will build the Docker images for all services and start them, along with their dependencies (e.g., PostgreSQL, Redis, Kafka).

4.  **Access the application:**
    Once all services are up and running, the frontend application will typically be accessible at `http://localhost:3000` (or another port specified in the `docker-compose.yml`).

## Contributing

Refer to the `CONTRIBUTING.md` file for guidelines on how to contribute to the Architech project.

## License

This project is licensed under the [License Name] License - see the `LICENSE.md` file for details.

---

**Author:** Rick / Elshaday

**Date:** 2025-07-20


