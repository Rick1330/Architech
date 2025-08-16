# Component Palette Feature

## Overview
The Component Palette provides a searchable library of architectural components that can be dragged onto the canvas to build system diagrams.

## Components

### Core Components
- `ComponentPalette.tsx` - Main palette interface
- `ComponentCard.tsx` - Individual component cards

## Features

### Component Categories
- **Infrastructure**: Servers, load balancers, databases
- **Services**: APIs, microservices, functions
- **Data**: Caches, queues, storage systems
- **Security**: Gateways, authentication services

### Search and Filter
- Real-time search functionality
- Category-based filtering
- Favorites system for commonly used components

### Drag and Drop
- Visual drag feedback
- Drop zone validation
- Component instantiation on canvas

## Usage

```tsx
import { ComponentPalette } from '@/features/component-palette';

function Sidebar() {
  return (
    <aside className="w-64">
      <ComponentPalette />
    </aside>
  );
}
```

## Component Types
Each component type includes:
- Visual icon and styling
- Default properties
- Connection constraints
- Simulation behavior

## Accessibility
- Keyboard navigation support
- Screen reader friendly labels
- Focus management for drag operations

## Performance
- Virtualized rendering for large component libraries
- Memoized search results
- Optimized drag operations