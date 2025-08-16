# Features Directory

This directory organizes the application into feature-based modules, following the principle of grouping related files by feature rather than by type.

## Structure

Each feature directory contains:
- Components specific to that feature
- Hooks and utilities for the feature
- Types and interfaces
- Tests
- Documentation (README.md)

## Current Features

### 🎨 simulation-canvas
Core canvas functionality for designing and simulating system architectures.
- Visual node-based editor
- Real-time simulation engine
- Component interaction and status visualization

### 🧩 component-palette  
Searchable library of architectural components for drag-and-drop functionality.
- Component categorization
- Search and filtering
- Favorites system

### ⚙️ property-panel
Property editing interface with real-time validation and metrics display.
- Tabbed interface (Config, Metrics, Logs)
- Dynamic property types
- Live validation

## Feature Guidelines

### Organization
```
src/features/
├── feature-name/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── __tests__/
│   └── README.md
```

### Naming Conventions
- Feature directories: `kebab-case`
- Components: `PascalCase`
- Hooks: `camelCase` starting with `use`
- Utilities: `camelCase`

### Dependencies
- Features should be as independent as possible
- Shared utilities go in `src/lib/`
- Cross-feature communication through the store (`src/stores/`)

### Testing
Each feature should include:
- Unit tests for components
- Integration tests for hooks
- End-to-end tests for critical user flows

### Documentation
Each feature must have a README.md explaining:
- Purpose and overview
- Key components and their usage
- API reference
- Examples
- Performance considerations