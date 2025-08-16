# Phase 4: Frontend Design Canvas & Basic Interaction

## Goal
Build the interactive visual design canvas, allowing users to add, connect, and configure components.

## 1. WHAT TO BUILD

### 1.1. Frontend Application Setup

*   **Description:** Initialize the frontend application using a modern JavaScript framework (e.g., React, Vue, or Angular) and configure its build system, routing, and state management.
*   **Files to be created:**
    *   `./frontend/package.json`: Node.js project configuration and dependencies.
    *   `./frontend/src/index.js` (or `main.ts`): Application entry point.
    *   `./frontend/src/App.js`: Main application component.
    *   `./frontend/src/router/index.js`: Frontend routing configuration.
    *   `./frontend/src/store/index.js`: Global state management setup (e.g., Redux, Vuex, NgRx).
    *   `./frontend/public/index.html`: Main HTML template.
    *   `./frontend/.env.development`, `./frontend/.env.production`: Environment variables for API endpoints.
    *   `./frontend/src/styles/global.css`: Global CSS styles.
*   **File Locations:** `./frontend/`
*   **Component Interaction:** The frontend will be a standalone application that communicates with backend services via HTTP requests.

### 1.2. Design Canvas Component

*   **Description:** Develop the core interactive canvas where users will build their system designs. This component will handle rendering of components and connections.
*   **Files to be created:**
    *   `./frontend/src/components/DesignCanvas/DesignCanvas.js`: Main canvas component.
    *   `./frontend/src/components/DesignCanvas/CanvasRenderer.js`: Logic for rendering components and connections (e.g., using Konva.js, PixiJS, or SVG/Canvas API).
    *   `./frontend/src/components/DesignCanvas/CanvasUtils.js`: Utility functions for canvas interactions (e.g., coordinate transformations).
    *   `./frontend/src/components/DesignCanvas/DesignCanvas.css`: Styles for the canvas.
*   **File Locations:** `./frontend/src/components/DesignCanvas/`
*   **Component Interaction:** Receives design data from the frontend state, renders it, and emits events for user interactions (e.g., component moved, connection drawn).

### 1.3. Drag-and-Drop Functionality

*   **Description:** Implement the ability for users to drag components from a palette onto the design canvas.
*   **Files to be created/modified:**
    *   `./frontend/src/components/ComponentPalette/ComponentPalette.js`: Component palette UI.
    *   `./frontend/src/components/ComponentPalette/ComponentItem.js`: Individual draggable component items.
    *   `./frontend/src/components/DesignCanvas/DesignCanvas.js`: (Modify) Add drop handling logic.
    *   `./frontend/src/store/designSlice.js`: Redux/Vuex/NgRx slice for managing design state, including adding new components.
*   **File Locations:** `./frontend/src/components/ComponentPalette/`, `./frontend/src/components/DesignCanvas/`, `./frontend/src/store/`
*   **Component Interaction:** `ComponentPalette` provides draggable elements. `DesignCanvas` receives dropped elements and adds them to the design state.

### 1.4. Component Connection System

*   **Description:** Enable users to draw connections between components on the canvas, representing data flow or dependencies.
*   **Files to be created/modified:**
    *   `./frontend/src/components/DesignCanvas/ConnectionDrawer.js`: Logic for drawing and managing connections (e.g., line drawing, snapping to connection points).
    *   `./frontend/src/components/DesignCanvas/DesignCanvas.js`: (Modify) Integrate connection drawing logic.
    *   `./frontend/src/store/designSlice.js`: (Modify) Add logic for adding new connections to the design state.
*   **File Locations:** `./frontend/src/components/DesignCanvas/`, `./frontend/src/store/`
*   **Component Interaction:** User interaction on the canvas triggers connection drawing. The canvas updates the design state with new connection data.

### 1.5. Property Panel for Configuring Component Attributes

*   **Description:** Develop a dynamic panel that displays and allows editing of properties for selected components or connections.
*   **Files to be created:**
    *   `./frontend/src/components/PropertyPanel/PropertyPanel.js`: Main property panel component.
    *   `./frontend/src/components/PropertyPanel/ComponentProperties.js`: Renders properties for a selected component.
    *   `./frontend/src/components/PropertyPanel/ConnectionProperties.js`: Renders properties for a selected connection.
    *   `./frontend/src/components/PropertyPanel/PropertyInput.js`: Generic input components (text, number, dropdown).
    *   `./frontend/src/store/uiSlice.js`: Redux/Vuex/NgRx slice for managing UI state, including selected component/connection.
*   **File Locations:** `./frontend/src/components/PropertyPanel/`, `./frontend/src/store/`
*   **Component Interaction:** The `DesignCanvas` emits an event when a component/connection is selected. The `PropertyPanel` listens to this event, fetches the relevant properties from the design state, and allows the user to modify them. Changes are then dispatched back to the design state.

### 1.6. Integration with Design Service API

*   **Description:** Implement API calls to the Design Service for saving and loading user designs.
*   **Files to be created/modified:**
    *   `./frontend/src/api/designApi.js`: API client for Design Service endpoints.
    *   `./frontend/src/store/designSlice.js`: (Modify) Add async thunks/actions for saving and loading designs.
    *   `./frontend/src/views/DesignEditorPage.js`: Page component that orchestrates saving/loading.
*   **File Locations:** `./frontend/src/api/`, `./frontend/src/store/`, `./frontend/src/views/`
*   **Component Interaction:** The frontend application will make HTTP requests to the Design Service to persist and retrieve design data.

## 2. WHO BUILDS IT

*   **Lovable/MGX.dev:**
    *   Leads the implementation of the entire frontend application, focusing on UI/UX fidelity and responsiveness.
    *   Develops the `DesignCanvas`, `ComponentPalette`, `PropertyPanel`, and all their sub-components.
    *   Translates design system specifications into actual UI elements.
    *   Handles interactive elements like drag-and-drop and connection drawing.
*   **Cursor:**
    *   Assists with complex state management logic within Redux/Vuex/NgRx slices.
    *   Implements the `designApi.js` client and integrates it with the frontend state management.
    *   Writes comprehensive unit and integration tests for frontend components and API interactions.
    *   Assists with debugging frontend performance issues.
*   **Human Dev Team (Oversight):**
    *   Provides UI/UX designs and detailed component specifications.
    *   Reviews frontend code for adherence to design principles, performance, and accessibility.
    *   Conducts usability testing and provides feedback on user experience.

## 3. HOW TO VERIFY

### 3.1. Frontend Application Setup Verification

*   **Test Specs:**
    *   Run `npm install` and `npm start` (or equivalent) successfully.
    *   Access the application in a web browser.
    *   Verify basic routing works.
*   **Metrics/Checkpoints:** Application loads without errors; initial page renders correctly.
*   **Expected Output/Review Checklist:**
    *   Browser console shows no JavaScript errors.
    *   Application loads within 2 seconds on a standard development machine.

### 3.2. Design Canvas Component Verification

*   **Test Specs:**
    *   Unit tests for `CanvasRenderer.js` to ensure correct rendering of mock components/connections.
    *   Manual testing: Verify canvas renders correctly across different browser sizes.
*   **Metrics/Checkpoints:** Canvas renders without visual glitches; performance remains smooth with a moderate number of elements (e.g., 50 components).
*   **Expected Output/Review Checklist:**
    *   Components and connections appear as expected on the canvas.
    *   No flickering or rendering artifacts during interactions.

### 3.3. Drag-and-Drop Functionality Verification

*   **Test Specs:**
    *   Manual testing: Drag components from the palette onto the canvas.
    *   Verify components can be moved around the canvas after being dropped.
*   **Metrics/Checkpoints:** Components drop accurately; position updates correctly.
*   **Expected Output/Review Checklist:**
    *   Dropped components appear at the correct location.
    *   Components can be freely repositioned.

### 3.4. Component Connection System Verification

*   **Test Specs:**
    *   Manual testing: Draw connections between various component types.
    *   Verify connections are visually correct and snap to connection points.
    *   Test deleting components with active connections.
*   **Metrics/Checkpoints:** Connections are drawn smoothly; connection lines follow component movements.
*   **Expected Output/Review Checklist:**
    *   Connections are created and displayed correctly.
    *   Deleting a component also removes its associated connections.

### 3.5. Property Panel Verification

*   **Test Specs:**
    *   Manual testing: Select different components/connections and verify the property panel updates correctly.
    *   Edit properties (e.g., change service name, processing time) and verify changes are reflected on the canvas and in the internal state.
*   **Metrics/Checkpoints:** Property panel updates instantly on selection; property changes are applied correctly.
*   **Expected Output/Review Checklist:**
    *   Property panel displays relevant properties for the selected element.
    *   Changes made in the property panel are reflected in the design.

### 3.6. Integration with Design Service API Verification

*   **Test Specs:**
    *   Create a design in the UI, save it, then reload the page and verify the design persists.
    *   Create a complex design, save it, and verify the backend database contains the correct structure.
    *   Test error handling for API calls (e.g., network issues, invalid data).
*   **Metrics/Checkpoints:** Designs save and load reliably; API calls are efficient.
*   **Expected Output/Review Checklist:**
    *   Successful API requests and responses observed in network tab of browser dev tools.
    *   Designs are consistently saved and retrieved.

---

**Author:** Manus AI

**Date:** 2025-07-19


