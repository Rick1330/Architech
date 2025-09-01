# CI/CD Pipeline

This document provides an overview of the CI/CD pipeline for the Architech frontend application. The pipeline is defined in the `.github/workflows/new-frontend-ci.yml` file.

## Pipeline Triggers

The pipeline is triggered by the following events:

-   **Push** to the `main` or `fix/ci-test-script` branches.
-   **Pull request** to the `main` branch.

## Pipeline Jobs

The pipeline consists of the following jobs:

### 1. Test Frontend (`test`)

This job runs on every trigger. It performs the following steps:

-   Checks out the code.
-   Sets up Node.js.
-   Installs dependencies with `npm install`.
-   Runs type checking with `npx tsc --noEmit`.
-   Runs linting with `npm run lint`.
-   Runs unit tests with `npm run test`.
-   Builds the application with `npm run build`.
-   Uploads the build artifacts.

### 2. Build Docker Image (`docker-build`)

This job runs after the `test` job completes successfully. It performs the following steps:

-   Checks out the code.
-   Sets up Docker Buildx.
-   Logs in to the GitHub Container Registry.
-   Logs in to Docker Hub using the `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets.
-   Extracts metadata for the Docker image.
-   Builds and pushes the Docker image to the GitHub Container Registry.

**Note:** This job requires the `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets to be set in the repository settings.

### 3. End-to-End Tests (`e2e-tests`)

This job runs after the `test` job completes successfully. It performs the following steps:

-   Checks out the code.
-   Sets up Node.js.
-   Installs dependencies with `npm install`.
-   Installs Playwright browsers.
-   Runs the Playwright E2E tests.
-   Uploads the Playwright report.

### 4. Deploy to Staging (`deploy-staging`)

This job runs after the `test` and `docker-build` jobs complete successfully. It is currently a placeholder and does not perform any actions.

### 5. Deploy to Production (`deploy-production`)

This job runs after the `test` and `docker-build` jobs complete successfully. It is currently a placeholder and does not perform any actions.

### 6. Security Scan (`security-scan`)

This job runs on every push and pull request. It performs the following steps:

-   Checks out the code.
-   Runs a Trivy vulnerability scanner on the codebase.
-   Uploads the scan results to the GitHub Security tab.
