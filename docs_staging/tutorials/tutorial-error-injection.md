
# Tutorial: Error Injection with Architech

## 1. Introduction

This tutorial builds upon the `tutorial-basic-simulation.md` and introduces you to the powerful fault injection capabilities of Architech. You will learn how to simulate failures in your system design to test its resilience and validate the effectiveness of patterns like retries and circuit breakers.

## 2. Prerequisites

*   Completion of the `tutorial-basic-simulation.md`.
*   A basic understanding of resilience patterns in distributed systems.

## 3. Step-by-Step Guide

### Step 3.1: Load Your Previous Design

1.  Launch Architech and log in.
2.  From your dashboard, open the "My First Microservice" project you created in the previous tutorial.

### Step 3.2: Add a Retry Mechanism

Let's first add a retry mechanism to our `WebServer` to handle transient database failures.

1.  Double-click on the "WebServer" component to open its properties panel.
2.  In the properties, find the "Retry Policy" section.
3.  Configure the retry policy as follows:
    *   **Enable Retries:** `Yes`
    *   **Max Retries:** `3`
    *   **Backoff Strategy:** `Exponential`
    *   **Initial Backoff (ms):** `100`

### Step 3.3: Inject a Database Failure

Now, let's simulate a failure in the `UserDB` to see how our retry mechanism works.

1.  On the right-hand panel, locate the "Fault Injection" section.
2.  Click "Add Fault".
3.  Configure the fault injection as follows:
    *   **Fault Type:** `Component Failure`
    *   **Target Component:** `UserDB`
    *   **Failure Duration (ms):** `5000` (5 seconds)
    *   **Start Time (ms):** `10000` (10 seconds into the simulation)

### Step 3.4: Run the Simulation with Fault Injection

1.  Ensure your request generator is still configured to send 10 RPS to the `WebServer`.
2.  Click "Start Simulation".

### Step 3.5: Observe the Impact of the Failure

1.  **Metrics Panel:**
    *   Watch the metrics as the simulation runs. Around the 10-second mark, you should see:
        *   **UserDB:** The "Request Count" will stop increasing for 5 seconds.
        *   **WebServer:** The "Error Rate" might briefly increase, but then the retry mechanism should kick in. You will likely see an increase in the "Average Latency" as requests are being retried.
2.  **Event Log:**
    *   Open the "Event Log" panel. Around the 10-second mark, you will see events like:
        *   `[TIMESTAMP] Fault Injected: UserDB is now unavailable`
        *   `[TIMESTAMP] WebServer calling UserDB for Request Y - FAILED`
        *   `[TIMESTAMP] WebServer retrying call to UserDB for Request Y (Attempt 1)`
        *   `[TIMESTAMP] WebServer retrying call to UserDB for Request Y (Attempt 2)`
    *   After the 5-second failure duration, you will see:
        *   `[TIMESTAMP] Fault Recovered: UserDB is now available`
        *   `[TIMESTAMP] WebServer retrying call to UserDB for Request Y (Attempt 3) - SUCCESS`

### Step 3.6: Add a Circuit Breaker

Now, let's add a circuit breaker to prevent the `WebServer` from continuously retrying when the `UserDB` is down for an extended period.

1.  Stop the simulation.
2.  Double-click on the "WebServer" component.
3.  In the properties, find the "Circuit Breaker" section.
4.  Configure the circuit breaker as follows:
    *   **Enable Circuit Breaker:** `Yes`
    *   **Failure Threshold:** `5` (open the circuit after 5 consecutive failures)
    *   **Reset Timeout (ms):** `10000` (10 seconds)

### Step 3.7: Run the Simulation with the Circuit Breaker

1.  Keep the same fault injection configuration for the `UserDB`.
2.  Click "Start Simulation".

### Step 3.8: Observe the Circuit Breaker in Action

1.  **Metrics Panel:**
    *   Around the 10-second mark, you will see the `WebServer`'s error rate increase as it retries.
    *   After 5 consecutive failures, the circuit breaker will open. You will see the `WebServer`'s error rate spike, but its latency will decrease because it is now failing fast instead of waiting for timeouts.
2.  **Event Log:**
    *   You will see events indicating that the circuit breaker has opened:
        *   `[TIMESTAMP] Circuit Breaker for UserDB has opened`
        *   `[TIMESTAMP] WebServer call to UserDB for Request Z - FAILED (Circuit Open)`
    *   After the 10-second reset timeout, you will see the circuit breaker enter a half-open state and then close if the `UserDB` has recovered.

## 4. Conclusion

In this tutorial, you have learned how to use Architech's fault injection capabilities to test the resilience of your system designs. You have seen how to simulate component failures and validate the effectiveness of resilience patterns like retries and circuit breakers. This powerful feature allows you to build more robust and reliable distributed systems.

---

**Author:** Manus AI

**Date:** 2025-07-17


