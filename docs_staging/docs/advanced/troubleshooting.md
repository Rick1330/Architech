
# Troubleshooting: Architech

## 1. Introduction

This document provides guidance for troubleshooting common issues that may arise while using Architech. It covers problems related to the development environment setup, simulation execution, and application behavior.

## 2. Development Environment Issues

### Issue: `docker-compose up` fails with a port conflict error.

*   **Cause:** Another application on your local machine is already using a port that one of Architech's services requires (e.g., 3000 for the frontend, 8080 for the backend, 5432 for PostgreSQL).
*   **Solution:**
    1.  Identify the conflicting port from the error message.
    2.  Find and stop the process that is using the port. You can use commands like `lsof -i :<port_number>` or `netstat -anp | grep <port_number>` on Linux/macOS.
    3.  Alternatively, you can change the port mapping in the `docker-compose.yml` file. For example, change `"3000:3000"` to `"3001:3000"` to map the frontend to port 3001 on your local machine.

### Issue: Docker containers fail to start or exit unexpectedly.

*   **Cause:** This can be due to various reasons, such as incorrect environment variables, missing dependencies, or insufficient resources.
*   **Solution:**
    1.  Check the logs of the failing container using `docker logs <container_name>`.
    2.  Verify that your `.env` file is correctly configured, especially for database connection strings and service endpoints.
    3.  Ensure you have allocated sufficient memory and CPU resources to Docker.
    4.  Try rebuilding the Docker images with `docker-compose up --build`.

### Issue: Dependency installation fails (`npm install` or `pip install`).

*   **Cause:** Network issues, incorrect package versions, or permission problems.
*   **Solution:**
    1.  Check your internet connection.
    2.  Ensure you are using the recommended versions of Node.js and Python as specified in `docs/dev-environment-setup.md`.
    3.  Try clearing the package manager cache (`npm cache clean --force` or `pip cache purge`).
    4.  Run the installation command with administrator privileges (`sudo`) if it's a permission issue, though this should generally be avoided.

## 3. Simulation Issues

### Issue: The simulation runs very slowly or freezes.

*   **Cause:**
    *   The system design is very large and complex.
    *   The configured request rate is extremely high.
    *   Your local machine has insufficient CPU or memory resources.
*   **Solution:**
    1.  Start with a simpler design and gradually increase its complexity.
    2.  Reduce the request rate in the simulation settings.
    3.  Close other resource-intensive applications on your machine.
    4.  If running locally, ensure you meet the recommended hardware specifications.

### Issue: The simulation results are not what I expected.

*   **Cause:**
    *   Incorrect configuration of component properties (e.g., processing times, latencies).
    *   Misunderstanding of component behavior.
    *   A bug in the simulation engine.
*   **Solution:**
    1.  **Review Component Configurations:** Double-check the properties of all components in your design.
    2.  **Use Observability Tools:**
        *   **Event Log:** Carefully examine the event log to trace the sequence of events and identify where the behavior deviates from your expectations.
        *   **Metrics:** Analyze the metrics for each component to pinpoint anomalies (e.g., a queue that is always full, a service with unexpectedly high latency).
        *   **Traces:** Use the tracing feature to follow individual requests and see exactly how they are being processed.
    3.  **Isolate the Problem:** Create a minimal, reproducible example of the issue. This will help you narrow down the cause and makes it easier to report as a bug if necessary.

### Issue: Fault injection doesn't seem to have any effect.

*   **Cause:**
    *   The fault injection scenario is not configured correctly.
    *   The system design is not sensitive to the specific fault being injected.
*   **Solution:**
    1.  Verify the fault injection parameters (target component, start time, duration).
    2.  Ensure the simulation runs long enough for the fault to be triggered.
    3.  Check the event log for messages indicating that the fault was injected and recovered.
    4.  Consider if your system has built-in resilience that is mitigating the fault's impact (which is a good thing!). Try a more severe fault to see a more pronounced effect.

## 4. Application and UI Issues

### Issue: The UI is unresponsive or buggy.

*   **Cause:** Browser issues, JavaScript errors, or network problems.
*   **Solution:**
    1.  **Refresh the Page:** A simple hard refresh (Ctrl+Shift+R or Cmd+Shift+R) can often resolve temporary UI glitches.
    2.  **Check Browser Console:** Open the browser's developer tools (F12) and check the console for any JavaScript errors.
    3.  **Clear Browser Cache:** Clear your browser's cache and cookies.
    4.  **Try a Different Browser:** See if the issue persists in a different web browser.
    5.  **Check Network Connectivity:** Ensure you have a stable internet connection.

### Issue: I can't save or load my designs.

*   **Cause:** Backend service issues, database connectivity problems, or permission errors.
*   **Solution:**
    1.  Check the browser's developer console for any network errors when you try to save/load.
    2.  Check the logs of the backend services (e.g., `Project Service`, `Design Service`) for any error messages.
    3.  Ensure the database container is running and accessible.

## 5. Reporting Issues

If you have tried the troubleshooting steps above and are still experiencing issues, please report a bug by opening an issue on our GitHub repository. Follow the guidelines in `CONTRIBUTING.md` to provide a detailed and helpful bug report.

---

**Author:** Manus AI

**Date:** 2025-07-17


