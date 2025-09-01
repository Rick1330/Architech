// Core types for the Architech application
import { Node, Edge } from '@xyflow/react';

// Component Types
export interface ComponentType {
  id: string;
  name: string;
  type: string;
  category: string;
  properties: ComponentProperty[];
  icon?: string;
  description?: string;
}

export interface ComponentProperty {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'textarea' | 'slider' | 'json';
  value: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Node Types
export interface ArchitectNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  properties: Record<string, unknown>;
  status?: 'idle' | 'running' | 'error' | 'success';
  metrics?: NodeMetrics;
}

export interface NodeMetrics {
  cpu?: number;
  memory?: number;
  requests?: number;
  errors?: number;
  latency?: number;
}

export type ArchitectNode = Node<ArchitectNodeData>;

// Edge Types
export interface ArchitectEdgeData extends Record<string, unknown> {
  label?: string;
  type?: string;
  metrics?: EdgeMetrics;
}

export interface EdgeMetrics {
  bandwidth?: number;
  latency?: number;
  errors?: number;
}

export type ArchitectEdge = Edge<ArchitectEdgeData>;

// API Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

// Design Types
export interface DesignData {
  id?: string;
  name: string;
  description?: string;
  version?: number;
  nodes: ArchitectNode[];
  edges: ArchitectEdge[];
  viewport?: { x: number; y: number; zoom: number };
  metadata?: Record<string, unknown>;
}

export interface BackendDesignData {
  design_data: {
    nodes: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      data: Record<string, unknown>;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      type?: string;
      data?: Record<string, unknown>;
    }>;
    viewport?: { x: number; y: number; zoom: number };
  };
  metadata?: Record<string, unknown>;
}

// Simulation Types
export interface SimulationEvent {
  id: string;
  type: string;
  timestamp: number;
  nodeId?: string;
  edgeId?: string;
  data: Record<string, unknown>;
}

export interface SimulationSession {
  id: string;
  designId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  events: SimulationEvent[];
  metrics: Record<string, unknown>;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp?: number;
}

export interface SimulationMessage extends WebSocketMessage {
  type: 'simulation_started' | 'simulation_stopped' | 'simulation_event' | 'simulation_metric';
  sessionId?: string;
}

// Form Types
export interface FormFieldConfig {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: Record<string, unknown>;
}

// Store Types
export interface StoreState {
  nodes: ArchitectNode[];
  edges: ArchitectEdge[];
  selectedNodeId: string | null;
  componentTypes: ComponentType[];
  isLoading: boolean;
  error: string | null;
}

export interface StoreActions {
  setNodes: (nodes: ArchitectNode[]) => void;
  setEdges: (edges: ArchitectEdge[]) => void;
  addNode: (node: ArchitectNode) => void;
  updateNode: (id: string, data: Partial<ArchitectNodeData>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: ArchitectEdge) => void;
  deleteEdge: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setComponentTypes: (types: ComponentType[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  designs?: Design[];
}

export interface ProjectCreateData {
  name: string;
  description?: string;
}

export interface ProjectUpdateData {
  name?: string;
  description?: string;
}

// Design API Types
export interface Design {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  version: number;
  design_data: {
    nodes: ArchitectNode[];
    edges: ArchitectEdge[];
    viewport?: { x: number; y: number; zoom: number };
  };
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DesignCreateData {
  name: string;
  description?: string;
  design_data: {
    nodes: ArchitectNode[];
    edges: ArchitectEdge[];
    viewport?: { x: number; y: number; zoom: number };
  };
  metadata?: Record<string, unknown>;
}

export interface DesignUpdateData {
  name?: string;
  description?: string;
  design_data?: {
    nodes: ArchitectNode[];
    edges: ArchitectEdge[];
    viewport?: { x: number; y: number; zoom: number };
  };
  metadata?: Record<string, unknown>;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Performance Types
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  unit?: string;
}

export interface PerformanceData {
  metrics: PerformanceMetric[];
  timestamp: number;
}