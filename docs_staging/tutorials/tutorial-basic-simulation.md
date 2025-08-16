# Tutorial: Basic Simulation with Architech

## 1. Introduction

This tutorial will guide you through the process of creating a simple distributed system design in Architech and running a basic simulation. You will learn how to add components, connect them, configure their properties, and observe the flow of requests through your system. This is a foundational tutorial to get you started with Architech.

## 2. Prerequisites

*   Access to the Architech platform (local development environment or deployed instance).
*   Basic understanding of distributed system concepts (services, databases, queues).

## 3. Step-by-Step Guide

### Step 3.1: Launch Architech and Create a New Project

1.  Open your web browser and navigate to the Architech application (e.g., `http://localhost:3000`).
2.  If you don't have an account, sign up. Otherwise, log in with your credentials.
3.  Once logged in, you will be on your dashboard. Click on the "New Project" button.
4.  Enter a project name (e.g., "My First Microservice") and an optional description. Click "Create Project".

### Step 3.2: Design Your First System

Now, let's design a simple system consisting of a client, a web service, and a database.

1.  **Add a Service Component:**
    *   On the left-hand panel, you will see a list of available components.
    *   Drag the "Generic Service" component onto the canvas. This will represent our web service.
    *   Double-click on the newly added service component. A properties panel will appear. Change its name to "WebServer" and set its "Processing Time (ms)" to `50`.
2.  **Add a Database Component:**
    *   From the component panel, drag the "Database" component onto the canvas.
    *   Double-click on the database component. Change its name to "UserDB" and set its "Read Latency (ms)" to `10` and "Write Latency (ms)" to `20`.
3.  **Connect the Components:**
    *   Hover over the "WebServer" component. You will see small connection points appear.
    *   Click and drag from a connection point on "WebServer" to a connection point on "UserDB". This creates a directed connection, indicating that the WebServer interacts with the UserDB.

Your canvas should now show two connected components.

### Step 3.3: Configure Request Generation

To simulate traffic, we need to configure a request generator.

1.  On the right-hand panel, locate the "Simulation Settings" or "Request Generator" section.
2.  Set the "Request Rate (RPS)" to `10` (10 requests per second).
3.  Select "WebServer" as the "Entry Point" for the requests.

### Step 3.4: Run the Simulation

With your system designed and request generation configured, you are ready to run your first simulation.

1.  Click the "Start Simulation" button, usually located at the top or bottom of the simulation settings panel.
2.  The simulation will begin. You will see requests flowing through your system.

### Step 3.5: Observe Simulation Results

As the simulation runs, Architech will display real-time observability data.

1.  **Metrics Panel:** Observe the metrics displayed for each component:
    *   **WebServer:** You should see the "Request Count" increasing and an "Average Latency" value (around 60-70ms, combining its own processing time and database interaction).
    *   **UserDB:** You should see its "Request Count" increasing, reflecting the calls from the WebServer.
2.  **Event Log:** Open the "Event Log" panel. You will see entries like:
    *   `[TIMESTAMP] Request X arrived at WebServer`
    *   `[TIMESTAMP] WebServer processing Request X`
    *   `[TIMESTAMP] WebServer calling UserDB for Request X`
    *   `[TIMESTAMP] UserDB processing Request X`
    *   `[TIMESTAMP] UserDB completed Request X`
    *   `[TIMESTAMP] WebServer completed Request X`

### Step 3.6: Stop and Save

1.  Click the "Stop Simulation" button.
2.  Click the "Save Design" button to save your current design with all its configurations.

## 4. Conclusion

Congratulations! You have successfully designed a simple distributed system, run a basic simulation, and observed its behavior using Architech. This foundational understanding will enable you to explore more complex designs and advanced features in future tutorials.

## 5. Next Steps

*   Experiment with different processing times and request rates.
*   Add more components like a Message Queue or a Load Balancer.
*   Explore the `tutorial-error-injection.md` to learn about simulating failures.

---

**Author:** Manus AI

**Date:** 2025-07-17


