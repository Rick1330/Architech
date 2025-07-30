# Component Guide

This guide provides an overview of the major React components in Architech Studio, their purpose, and how they interact with the application's state and API.

## Core UI Components (`src/components/`)

### `Header.tsx`

-   **Purpose:** The main application header. It displays the application logo and title.
-   **State Interaction:**
    -   Reads the list of projects (`state.projects`) and the currently selected project (`state.currentProject`) from `AppContext`.
    -   Dispatches actions to create a new project or switch between existing projects.
-   **API Interactions:**
    -   On load, it triggers an API call via the context to fetch all projects (`api.getProjects`).
    -   Handles saving the current project design (`api.saveProject`) and creating new projects (`api.createProject`).

### `Sidebar.tsx`

-   **Purpose:** The main sidebar on the left, containing the component palette and project explorer.
-   **State Interaction:**
    -   Its expanded/collapsed state is managed by `state.isPaletteExpanded` in `AppContext`.
-   **Key Child Component:**
    -   **`ComponentPalette.tsx`**: Renders the list of draggable system components from the static data in `src/lib/data.ts`. When a component is dragged, it initiates the process of adding a new component to the canvas.

### `DesignCanvas.tsx`

-   **Purpose:** The main interactive area where users build their architecture. It is responsible for rendering components and connections, and handling user interactions like panning, zooming, and dropping new components.
-   **State Interaction:**
    -   Renders components and connections from `state.components` and `state.connections`.
    -   Dispatches actions for panning (`PAN_CANVAS`), zooming (`SET_ZOOM`), and selecting elements.
    -   Handles the `onDrop` event to initiate the creation of a new component.
-   **API Interactions:** Indirectly triggers API calls through `props` passed from `AppContent` (e.g., `onAddComponent`).

### `PropertyPanel.tsx` & `ConnectionPropertyPanel.tsx`

-   **Purpose:** These panels appear on the right side to display and edit the properties of the currently selected component or connection.
-   **State Interaction:**
    -   They become visible when `state.selectedComponentId` or `state.selectedConnectionId` is set.
    -   They read the properties of the selected item from the global state.
    -   As the user edits properties, they dispatch `UPDATE_COMPONENT_PROPERTY` or `UPDATE_CONNECTION_PROPERTY` actions, which update the state in real-time.
-   **API Interactions:** The "Save Changes" button triggers an API call (`api.updateComponent` or `api.updateConnection`) to persist the changes to the backend.

### `BottomBar.tsx`

-   **Purpose:** A container for the toolbars at the bottom of the canvas.
-   **Key Child Components:**
    -   **`SimulationControls.tsx`**: Provides UI for starting, pausing, resuming, and stopping simulations. It dispatches actions that trigger API calls to the simulation engine.
    -   **`MetricsDashboard.tsx`**, **`LogViewer.tsx`**, **`AiAssistant.tsx`**: These components are displayed in modals and are responsible for showing observability data and interacting with the AI. They read their respective data (`metrics`, `logs`, `suggestions`) from the global state.
