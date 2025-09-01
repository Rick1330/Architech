# Simulation Canvas Feature

## Overview
The Simulation Canvas is the core feature that provides a visual interface for designing and simulating system architectures. It uses React Flow for the node-based editor and includes real-time simulation capabilities.

## Components

### Core Components
- `ArchitectCanvas.tsx` - Main canvas component with drag-and-drop functionality
- `ComponentPalette.tsx` - Draggable component library
- `SimulationTimeline.tsx` - Timeline control for simulation playback

### Node Types
- `GenericServiceNode.tsx` - General service components
- `DatabaseNode.tsx` - Database representations
- `CacheNode.tsx` - Cache layer components
- `LoadBalancerNode.tsx` - Load balancer components
- `APIGatewayNode.tsx` - API gateway components
- `MessageQueueNode.tsx` - Message queue components

### Edge Components
- `EnhancedArchitectEdge.tsx` - Animated connection with status indicators

## Key Features

### Visual Design
- Drag-and-drop component placement
- Visual connection between components
- Real-time status indicators
- Animated data flow visualization

### Simulation Engine
- Mock simulation with realistic metrics
- Status updates (active, error, warning)
- Performance metrics (CPU, memory, latency)
- Event generation and logging

### Property Management
- Dynamic property editing
- Real-time validation
- Component-specific configurations

## Usage

```tsx
import { ArchitectCanvas } from '@/features/simulation-canvas';

function App() {
  return (
    <div className="h-screen">
      <ArchitectCanvas />
    </div>
  );
}
```

## State Management
Uses Zustand store (`useArchitectStore`) for:
- Canvas node and edge state
- Simulation state and events
- Selected component tracking
- Project management

## Performance Considerations
- Memoized components prevent unnecessary re-renders
- Optimized simulation engine with controlled update intervals
- Efficient state updates using Zustand

## Future Enhancements
- Real backend integration
- Collaborative editing
- Export/import functionality
- Advanced simulation scenarios