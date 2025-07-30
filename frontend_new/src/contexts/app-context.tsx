
'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type {
  CanvasComponentData,
  Connection,
  SimulationState,
  Metrics,
  LogEntry,
  Project,
} from '@/lib/types';
import { PALETTE_COMPONENTS } from '@/lib/data';
import apiClient, { connectWebSocket, sendWebSocketMessage, disconnectWebSocket } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

/**
 * @file app-context.tsx
 * This file defines the core state management for the Architech Studio application.
 * It uses React's Context API and a reducer pattern to manage all shared state,
 * including the design canvas, projects, simulation data, and UI state.
 *
 * It also includes a mock API service for frontend development without a live backend.
 */

// =================================================================
// Real API Service
// =================================================================
/**
 * The real API service that interacts with the backend.
 * The methods in this object mirror the expected backend API endpoints.
 */
// Mock API Service for development without authentication
const mockApiService = {
  getProjects: async (): Promise<Project[]> => {
    console.log("API: getProjects");
    await new Promise(res => setTimeout(res, 500));
    return Promise.resolve([{ id: 'proj-1', name: 'Project Alpha' }, {id: 'proj-2', name: 'Project Beta'}]);
  },
  getProject: async (id: string): Promise<Project> => {
    console.log(`API: getProject with id ${id}`);
     await new Promise(res => setTimeout(res, 500));
    return Promise.resolve({ id, name: `Project ${id}`});
  },
  createProject: async (name: string): Promise<Project> => {
    console.log(`API: createProject with name ${name}`);
    await new Promise(res => setTimeout(res, 500));
    const newProject = { id: `proj-${Date.now()}`, name };
    return Promise.resolve(newProject);
  },
  saveProject: async (projectId: string, design: { components: CanvasComponentData[], connections: Connection[] }): Promise<void> => {
    console.log(`API: saveProject ${projectId}`, design);
    await new Promise(res => setTimeout(res, 500));
    return Promise.resolve();
  },
  addComponent: async (designId: string, component: any): Promise<CanvasComponentData> => {
    console.log(`API: addComponent to design ${designId}`);
    await new Promise(res => setTimeout(res, 500));
    const paletteComponent = PALETTE_COMPONENTS.find(p => p.type === component.type);
    const newId = `${component.type}-${Date.now()}`;
    const newComponent = { ...component, id: newId, name: `${component.name} ${Math.floor(Math.random()*100)}`, icon: paletteComponent?.icon };
    return Promise.resolve(newComponent);
  },
  deleteComponent: async (designId: string, componentId: string): Promise<void> => {
    console.log(`API: deleteComponent ${componentId} from design ${designId}`);
    await new Promise(res => setTimeout(res, 500));
    return Promise.resolve();
  },
  updateComponent: async (designId: string, componentId: string, updates: any): Promise<CanvasComponentData> => {
    console.log(`API: updateComponent ${componentId} in design ${designId}`);
    await new Promise(res => setTimeout(res, 500));
    return Promise.resolve({...updates});
  },
  addConnection: async (designId: string, connection: any): Promise<Connection> => {
    console.log(`API: addConnection to design ${designId}`);
    await new Promise(res => setTimeout(res, 500));
    const newConnection = {
        ...connection,
        id: `conn-${Date.now()}`,
        status: 'ok',
        throughput: 1,
        properties: {
          name: 'New Connection',
          protocol: 'HTTP/S',
          latency: 100,
          bandwidth: 1000,
          errorRate: 0,
          customProperties: '{}',
        }
    };
    return Promise.resolve(newConnection);
  },
  deleteConnection: async (designId: string, connectionId: string): Promise<void> => {
    console.log(`API: deleteConnection ${connectionId} from design ${designId}`);
    await new Promise(res => setTimeout(res, 500));
    return Promise.resolve();
  },
  updateConnection: async (designId: string, connectionId: string, updates: any): Promise<Connection> => {
    console.log(`API: updateConnection ${connectionId} in design ${designId}`);
    await new Promise(res => setTimeout(res, 500));
    return Promise.resolve({...updates});
  },
  startSimulation: async (designId: string) => {
    console.log(`API: startSimulation for design ${designId}`);
    const simulationId = `sim-${Date.now()}`;
    sendWebSocketMessage({ type: 'start', simulationId });
    return Promise.resolve({ simulationId });
  },
  controlSimulation: async (simId: string, action: 'pause' | 'resume' | 'stop') => {
    console.log(`API: controlSimulation ${simId} with action ${action}`);
    sendWebSocketMessage({ type: action, simulationId: simId });
    return Promise.resolve();
  },
};

// Real API Service for production use
const apiService = {
  getProjects: async (): Promise<Project[]> => {
    console.log("API: getProjects");
    const response = await apiClient.get('/projects');
    return response.data;
  },
  getProject: async (id: string): Promise<Project> => {
    console.log(`API: getProject with id ${id}`);
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },
  createProject: async (name: string): Promise<Project> => {
    console.log(`API: createProject with name ${name}`);
    const response = await apiClient.post('/projects', { name, description: '' });
    return response.data;
  },
  saveProject: async (projectId: string, design: { components: CanvasComponentData[], connections: Connection[] }): Promise<void> => {
    console.log(`API: saveProject ${projectId}`, design);
    // For now, we'll use the project service to save design data
    // In the future, this should use the design service
    await apiClient.put(`/projects/${projectId}`, { 
      components: JSON.stringify(design.components),
      connections: JSON.stringify(design.connections)
    });
  },
  addComponent: async (designId: string, component: any): Promise<CanvasComponentData> => {
    console.log(`API: addComponent to design ${designId}`);
    // Mock implementation for now - in production this would call design service
    await new Promise(res => setTimeout(res, 200));
    const paletteComponent = PALETTE_COMPONENTS.find(p => p.type === component.type);
    const newId = `${component.type}-${Date.now()}`;
    const newComponent = { ...component, id: newId, name: `${component.name} ${Math.floor(Math.random()*100)}`, icon: paletteComponent?.icon };
    return Promise.resolve(newComponent);
  },
  deleteComponent: async (designId: string, componentId: string): Promise<void> => {
    console.log(`API: deleteComponent ${componentId} from design ${designId}`);
    // Mock implementation for now
    await new Promise(res => setTimeout(res, 200));
    return Promise.resolve();
  },
  updateComponent: async (designId: string, componentId: string, updates: any): Promise<CanvasComponentData> => {
    console.log(`API: updateComponent ${componentId} in design ${designId}`);
    // Mock implementation for now
    await new Promise(res => setTimeout(res, 200));
    return Promise.resolve({...updates});
  },
  addConnection: async (designId: string, connection: any): Promise<Connection> => {
    console.log(`API: addConnection to design ${designId}`);
    // Mock implementation for now
    await new Promise(res => setTimeout(res, 200));
    const newConnection = {
        ...connection,
        id: `conn-${Date.now()}`,
        status: 'ok',
        throughput: 1,
        properties: {
          name: 'New Connection',
          protocol: 'HTTP/S',
          latency: 100,
          bandwidth: 1000,
          errorRate: 0,
          customProperties: '{}',
        }
    };
    return Promise.resolve(newConnection);
  },
  deleteConnection: async (designId: string, connectionId: string): Promise<void> => {
    console.log(`API: deleteConnection ${connectionId} from design ${designId}`);
    // Mock implementation for now
    await new Promise(res => setTimeout(res, 200));
    return Promise.resolve();
  },
  updateConnection: async (designId: string, connectionId: string, updates: any): Promise<Connection> => {
    console.log(`API: updateConnection ${connectionId} in design ${designId}`);
    // Mock implementation for now
    await new Promise(res => setTimeout(res, 200));
    return Promise.resolve({...updates});
  },
  startSimulation: async (designId: string) => {
    console.log(`API: startSimulation for design ${designId}`);
    const response = await apiClient.post(`/simulations/start`, { designId });
    return response.data;
  },
  controlSimulation: async (simId: string, action: 'pause' | 'resume' | 'stop') => {
    console.log(`API: controlSimulation ${simId} with action ${action}`);
    await apiClient.post(`/simulations/${simId}/control`, { action });
  },
};

// =================================================================
// App State and Types
// =================================================================
/**
 * Defines the shape of the entire application's state.
 * This state is managed by the `appReducer` and provided to all components
 * via the `AppContext`.
 */
interface AppState {
  // Project and Design Data
  projects: Project[];
  currentProject: Project | null;
  currentDesignId: string | null;
  components: CanvasComponentData[];
  connections: Connection[];
  selectedComponentId: string | null;
  selectedConnectionId: string | null;

  // Simulation and Observability State
  simulationState: SimulationState;
  simulationId: string | null;
  simulationTime: number; // Current time in seconds
  simulationProgress: number; // Progress as a percentage (0-100)
  simulationSpeed: number; // Playback speed multiplier
  metrics: Metrics;
  logs: LogEntry[];

  // UI State
  connecting: { from: string | null }; // Tracks if a user is in the middle of creating a connection
  zoom: number;
  pan: { x: number; y: number };
  isPanning: boolean;
  isPaletteExpanded: boolean;
  isLoading: boolean; // Global loading state for async operations
  error: string | null; // Global error message
}

/**
 * Defines all possible actions that can be dispatched to the reducer.
 * Each action has a `type` and an optional `payload`.
 */
type Action =
  // Project Actions
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT_SUCCESS'; payload: Project }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project }
  // Design Actions
  | { type: 'SET_DESIGN'; payload: { components: CanvasComponentData[], connections: Connection[] } }
  | { type: 'ADD_COMPONENT_SUCCESS'; payload: CanvasComponentData }
  | { type: 'DELETE_COMPONENT_SUCCESS'; payload: { id: string } }
  | { type: 'UPDATE_COMPONENT_PROPERTY'; payload: { componentId: string; key: string; value: any } }
  | { type: 'UPDATE_COMPONENT_NAME'; payload: { id: string, name: string } }
  | { type: 'UPDATE_COMPONENT_POSITION'; payload: { id: string; position: { x: number; y: number } } }
  | { type: 'ADD_CONNECTION_SUCCESS'; payload: Connection }
  | { type: 'DELETE_CONNECTION_SUCCESS'; payload: { id: string } }
  | { type: 'UPDATE_CONNECTION_PROPERTY', payload: { connectionId: string; key: string; value: any }}
  // Selection Actions
  | { type: 'SELECT_COMPONENT'; payload: { id: string | null } }
  | { type: 'SELECT_CONNECTION'; payload: { id: string | null } }
  // Simulation Actions
  | { type: 'START_SIMULATION_SUCCESS', payload: { simulationId: string } }
  | { type: 'SET_SIMULATION_STATE', payload: SimulationState }
  | { type: 'SEEK_SIMULATION', payload: number }
  | { type: 'SET_SIMULATION_SPEED', payload: number }
  | { type: 'STEP_SIMULATION', payload: { direction: 'forward' | 'backward', totalDuration: number } }
  | { type: 'RESET_SIMULATION' }
  | { type: 'UPDATE_FROM_WEBSOCKET', payload: any } // Generic action for WebSocket data
  // UI Actions
  | { type: 'START_CONNECTION'; payload: { from: string } }
  | { type: 'FINISH_CONNECTION'; payload: { from: string, to: string } }
  | { type: 'CANCEL_CONNECTION' }
  | { type: 'TOGGLE_PALETTE' }
  | { type: 'SET_ZOOM'; payload: { zoom: number } }
  | { type: 'PAN_CANVAS'; payload: { dx: number, dy: number } }
  | { type: 'SET_PANNING'; payload: boolean }
  | { type: 'FIT_TO_VIEW' }
  // Async/Global State Actions
  | { type: 'SET_LOADING', payload: boolean }
  | { type: 'SET_ERROR', payload: string | null };

// =================================================================
// Initial State
// =================================================================
const initialState: AppState = {
  projects: [],
  currentProject: null,
  currentDesignId: 'design-1', // Mock ID, gets replaced on project selection
  components: [],
  connections: [],
  selectedComponentId: null,
  selectedConnectionId: null,
  simulationState: 'STOPPED',
  simulationId: null,
  simulationTime: 0,
  simulationProgress: 0,
  simulationSpeed: 1,
  metrics: { totalRequests: 0, avgLatency: 0, errorRate: 0, throughput: 0, latencyHistory: Array.from({ length: 20 }, (_, i) => ({ time: `${i*2}s`, latency: 0 })) },
  logs: [],
  connecting: { from: null },
  zoom: 1,
  pan: { x: 0, y: 0 },
  isPanning: false,
  isPaletteExpanded: true,
  isLoading: false,
  error: null,
};

// =================================================================
// App Context Definition
// =================================================================
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  api: typeof apiService; // Changed to apiService
} | null>(null);

// =================================================================
// Reducer Function
// =================================================================
/**
 * The main reducer function that handles all state transitions.
 * It takes the current state and an action, and returns the new state.
 * This function should be a pure function with no side effects.
 * @param state - The current application state.
 * @param action - The dispatched action to perform.
 * @returns The new application state.
 */
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    // --- Project Actions ---
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT_SUCCESS':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'SET_CURRENT_PROJECT':
      // Reset canvas when a new project is selected
      return { ...state, currentProject: action.payload, components: [], connections: [], currentDesignId: action.payload.id };

    // --- Design Actions ---
    case 'SET_DESIGN':
      return { ...state, components: action.payload.components, connections: action.payload.connections };
    case 'ADD_COMPONENT_SUCCESS':
      return { ...state, components: [...state.components, action.payload] };
    case 'DELETE_COMPONENT_SUCCESS':
      return {
          ...state,
          components: state.components.filter(c => c.id !== action.payload.id),
          connections: state.connections.filter(conn => conn.from !== action.payload.id && conn.to !== action.payload.id),
          selectedComponentId: state.selectedComponentId === action.payload.id ? null : state.selectedComponentId,
      };
    case 'UPDATE_COMPONENT_POSITION': {
      const { id, position } = action.payload;
      return {
        ...state,
        components: state.components.map((c) =>
          c.id === id ? { ...c, position } : c
        ),
      };
    }
    case 'UPDATE_COMPONENT_NAME':
      return {
        ...state,
        components: state.components.map(c =>
          c.id === action.payload.id ? { ...c, name: action.payload.name } : c
        ),
      };
    case 'UPDATE_COMPONENT_PROPERTY': {
        const { componentId, key, value } = action.payload;
        return {
            ...state,
            components: state.components.map(c =>
                c.id === componentId ? { ...c, properties: { ...c.properties, [key]: value } } : c
            ),
        };
    }
    case 'ADD_CONNECTION_SUCCESS':
      return { ...state, connections: [...state.connections, action.payload], connecting: { from: null } };
    case 'DELETE_CONNECTION_SUCCESS':
        return {
            ...state,
            connections: state.connections.filter(c => c.id !== action.payload.id),
            selectedConnectionId: state.selectedConnectionId === action.payload.id ? null : state.selectedConnectionId,
        };
    case 'UPDATE_CONNECTION_PROPERTY': {
      const { connectionId, key, value } = action.payload;
      return {
        ...state,
        connections: state.connections.map(c =>
          c.id === connectionId ? { ...c, properties: { ...c.properties, [key]: value } } : c
        ),
      };
    }

    // --- Selection and UI Actions ---
    case 'SELECT_COMPONENT': {
       if (state.connecting.from) {
        if (action.payload.id && action.payload.id !== state.connecting.from) {
           return {
            ...state,
            connecting: { from: null },
            selectedComponentId: null,
          };
        }
        return state;
      }
      return { ...state, selectedComponentId: action.payload.id, selectedConnectionId: null };
    }
    case 'SELECT_CONNECTION': {
      return { ...state, selectedConnectionId: action.payload.id, selectedComponentId: null };
    }
    case 'START_CONNECTION': {
        return { ...state, connecting: { from: action.payload.from }, selectedComponentId: null, selectedConnectionId: null };
    }
    case 'CANCEL_CONNECTION': {
        return { ...state, connecting: { from: null } };
    }

    // --- Simulation Actions ---
    case 'START_SIMULATION_SUCCESS':
      return { ...state, simulationState: 'RUNNING', simulationId: action.payload.simulationId, logs: [], metrics: initialState.metrics };
    case 'SET_SIMULATION_STATE': {
       if (action.payload === 'STOPPED') {
          return {
            ...state,
            simulationState: 'STOPPED',
            simulationTime: 0,
            simulationProgress: 0,
            simulationId: null,
            logs: [],
            metrics: initialState.metrics
          };
        }
        return { ...state, simulationState: action.payload };
    }
    case 'SEEK_SIMULATION': {
        const newProgress = action.payload;
        const newTime = (newProgress / 100) * 60; // Assuming total duration is 60s
        return { ...state, simulationProgress: newProgress, simulationTime: newTime };
    }
    case 'SET_SIMULATION_SPEED':
        return { ...state, simulationSpeed: action.payload };
    case 'STEP_SIMULATION': {
        const stepAmount = (action.payload.totalDuration / 20) * (action.payload.direction === 'forward' ? 1 : -1);
        const newTime = Math.max(0, Math.min(action.payload.totalDuration, state.simulationTime + stepAmount));
        const newProgress = (newTime / action.payload.totalDuration) * 100;
        return { ...state, simulationTime: newTime, simulationProgress: newProgress };
    }
    case 'RESET_SIMULATION':
        return {
            ...state,
            simulationState: 'STOPPED',
            simulationId: null,
            simulationTime: 0,
            simulationProgress: 0,
            logs: [],
            metrics: { ...initialState.metrics, latencyHistory: Array.from({ length: 20 }, (_, i) => ({ time: `${i*2}s`, latency: 0 })) },
            components: state.components.map(c => ({...c, status: 'ok'}))
        };
    case 'UPDATE_FROM_WEBSOCKET': {
        const { type, payload } = action.payload;
        if (type === 'metrics') {
            return { ...state, metrics: payload };
        }
        if (type === 'logs') {
            return { ...state, logs: [...payload, ...state.logs].slice(0, 100) };
        }
        if (type === 'componentStatus') {
            return {
                ...state,
                components: state.components.map(c =>
                    c.id === payload.id ? { ...c, status: payload.status } : c
                ),
            };
        }
        if (type === 'connectionStatus') {
            return {
                ...state,
                connections: state.connections.map(c =>
                    c.id === payload.id ? { ...c, status: payload.status } : c
                ),
            };
        }
        return state;
    }

    // --- UI Actions ---
    case 'START_CONNECTION':
      return { ...state, connecting: { from: action.payload.from }, selectedComponentId: null, selectedConnectionId: null };
    case 'FINISH_CONNECTION':
      // This action is typically handled by ADD_CONNECTION_SUCCESS after API call
      return { ...state, connecting: { from: null } };
    case 'CANCEL_CONNECTION':
      return { ...state, connecting: { from: null } };
    case 'TOGGLE_PALETTE':
      return { ...state, isPaletteExpanded: !state.isPaletteExpanded };
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload.zoom };
    case 'PAN_CANVAS':
      return { ...state, pan: { x: state.pan.x + action.payload.dx, y: state.pan.y + action.payload.dy } };
    case 'SET_PANNING':
      return { ...state, isPanning: action.payload };
    case 'FIT_TO_VIEW':
      return { ...state, zoom: 1, pan: { x: 0, y: 0 } }; // Reset zoom and pan

    default:
      return state;
  }
}

// =================================================================
// App Provider Component
// =================================================================
/**
 * The `AppProvider` component wraps the entire application and provides
 * the application state and dispatch function to all child components
 * via the `AppContext`.
 * It also initializes the WebSocket connection for real-time updates.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    // Connect WebSocket when component mounts
    connectWebSocket((data) => {
      dispatch({ type: 'UPDATE_FROM_WEBSOCKET', payload: data });
    });

    // Disconnect WebSocket when component unmounts
    return () => {
      disconnectWebSocket();
    };
  }, []);

  // Load projects on initial mount
  useEffect(() => {
    const loadProjects = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const projects = await apiService.getProjects();
        dispatch({ type: 'SET_PROJECTS', payload: projects });
        if (projects.length > 0) {
          // For now, automatically select the first project and load its design
          dispatch({ type: 'SET_CURRENT_PROJECT', payload: projects[0] });
          const projectDesign = await apiService.getProject(projects[0].id); // Assuming getProject returns design
          dispatch({ type: 'SET_DESIGN', payload: { components: projectDesign.components || [], connections: projectDesign.connections || [] } });
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load projects' });
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load projects' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadProjects();
  }, [toast]);

  // Save design whenever components or connections change
  useEffect(() => {
    if (state.currentDesignId && (state.components.length > 0 || state.connections.length > 0)) {
      const saveDesign = async () => {
        try {
          await apiService.saveProject(state.currentDesignId!, { components: state.components, connections: state.connections });
          console.log('Design saved successfully!');
        } catch (err) {
          console.error('Failed to save design:', err);
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to save design' });
        }
      };
      const handler = setTimeout(saveDesign, 1000); // Debounce save for 1 second
      return () => clearTimeout(handler);
    }
  }, [state.components, state.connections, state.currentDesignId, toast]);

  return (
    <AppContext.Provider value={{ state, dispatch, api: mockApiService }}>
      {children}
    </AppContext.Provider>
  );
}

// =================================================================
// Custom Hook for App Context
// =================================================================
/**
 * Custom hook to easily access the application context (state, dispatch, api).
 * @returns The AppContext value.
 * @throws Error if used outside of an AppProvider.
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}


