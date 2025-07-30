# Application Architecture

Architech Studio is built on a modern frontend architecture designed for maintainability, scalability, and a robust user experience. The core architectural pillars are State Management, API Integration, and AI Integration.

## 1. State Management

All global application state is managed through a centralized system using **React Context and a Reducer pattern**, implemented in `src/contexts/app-context.tsx`.

### Key Concepts

-   **Single Source of Truth:** The `AppContext` provides a single, consistent state object (`AppState`) to the entire application. This state includes everything from the components on the canvas to the current simulation status and UI settings.
-   **Immutable State:** State is treated as immutable. All changes are managed by a pure function called `appReducer`.
-   **Predictable State Transitions:** Instead of modifying state directly, components dispatch `actions` (e.g., `{ type: 'ADD_COMPONENT_SUCCESS', payload: ... }`). The reducer processes these actions and returns a *new* state object, ensuring that state changes are predictable and easy to trace.
-   **Decoupling:** This pattern decouples components from the state mutation logic. Components only need to know *what* action to dispatch, not *how* the state will change.

### State Shape (`AppState`)

The global state includes:
-   Project and design data (`projects`, `components`, `connections`).
-   UI state (`selectedComponentId`, `zoom`, `pan`, `isPaletteExpanded`).
-   Simulation and observability data (`simulationState`, `metrics`, `logs`).
-   Global async state (`isLoading`, `error`).

## 2. API Integration Layer

All communication with the external backend is handled by a dedicated API integration layer defined in `src/lib/api-client.ts`.

### RESTful API Client (Axios)

-   **Centralized Instance:** A single `axios` instance is configured with the base URL of the backend API gateway.
-   **Request Interceptor:** Before any request is sent, an interceptor automatically attaches the user's authentication token (as a `Bearer` token) to the `Authorization` header.
-   **Response Interceptor:** After a response is received, an interceptor checks for global errors. For example, a `401 Unauthorized` status will be caught here, allowing for centralized handling like redirecting to a login page.

### WebSocket Client

-   **Real-time Communication:** The application uses a native WebSocket client to connect to the simulation engine.
-   **Event-Driven:** The client handles standard WebSocket events (`onopen`, `onmessage`, `onerror`, `onclose`).
-   **State Updates:** Incoming messages are parsed and used to dispatch actions to the `appReducer`, which then updates the UI in real-time (e.g., updating component statuses, metrics, or logs).

## 3. AI Integration (Genkit)

AI-powered features, like the Design Assistant, are implemented using **Genkit**, a framework for building with large language models.

-   **Server-Side Flows:** The core AI logic is defined in server-side files located in `src/ai/flows/`. These flows define the prompts and structured inputs/outputs (using Zod schemas) for interacting with the AI model.
-   **Next.js Server Actions:** The Genkit flows are securely exposed to the frontend using **Next.js Server Actions** (`src/app/actions.ts`). This allows client components to call the server-side AI functions as if they were local async functions, without needing to create traditional API endpoints.
