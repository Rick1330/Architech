# Lovable Frontend Development Guidance

## 1. Introduction

This document provides specific guidance for interacting with Lovable to develop the frontend components of Architech. Lovable excels at creating beautiful, interactive user interfaces through iterative AI-driven development. This guidance ensures that Lovable's capabilities are leveraged effectively to build a cohesive, user-friendly, and performant frontend application.

## 2. Core Principles for Lovable Interaction

*   **Visual-First Approach:** Lovable works best when provided with clear visual references, mockups, or detailed descriptions of the desired UI appearance.
*   **Iterative Refinement:** Expect to iterate on designs multiple times. Start with basic functionality and progressively enhance the visual appeal and user experience.
*   **Component-Based Thinking:** Frame requests in terms of reusable components that can be composed into larger interfaces.
*   **Responsive Design:** Always specify that components should be responsive and work across different screen sizes.
*   **Accessibility:** Emphasize the importance of accessibility features in all UI components.

## 3. Effective Prompting Strategies

### 3.1. Component Creation Prompts

When requesting new UI components, structure prompts as follows:

**Template:**
```
Create a [component type] component for [specific purpose] that:
- [Visual requirement 1]
- [Functional requirement 1]
- [Responsive behavior]
- [Accessibility requirement]
- Uses [specific design system/styling approach]
```

**Example:**
```
Create a DesignCanvas component for the system design editor that:
- Displays a large, scrollable canvas area with a light gray background
- Supports drag-and-drop of components from a side palette
- Shows connection lines between components as curved SVG paths
- Includes zoom in/out controls in the bottom-right corner
- Is fully responsive and works on tablets (minimum 768px width)
- Supports keyboard navigation for accessibility
- Uses Tailwind CSS for styling with a modern, clean aesthetic
```

### 3.2. Layout and Page Prompts

For full page layouts:

**Template:**
```
Design a [page name] page layout that includes:
- [Header/navigation requirements]
- [Main content area description]
- [Sidebar/panel requirements]
- [Footer requirements]
- [Responsive behavior across devices]
- [Color scheme and branding]
```

**Example:**
```
Design a Design Editor page layout that includes:
- A top navigation bar with project name, save button, and user menu
- A left sidebar component palette (250px wide, collapsible on mobile)
- A main canvas area taking up the remaining space
- A right property panel (300px wide, slides over content on mobile)
- A bottom status bar showing simulation status
- Responsive design that stacks panels vertically on screens < 1024px
- Uses a professional blue and white color scheme
```

### 3.3. Interactive Element Prompts

For complex interactions:

**Template:**
```
Implement [interaction type] for [component] that:
- [Trigger description]
- [Visual feedback during interaction]
- [End state/result]
- [Error handling]
- [Accessibility considerations]
```

**Example:**
```
Implement drag-and-drop functionality for the ComponentPalette that:
- Allows dragging service icons from the palette to the canvas
- Shows a ghost image of the component while dragging
- Highlights valid drop zones on the canvas with a blue border
- Snaps components to a grid when dropped
- Shows error feedback if dropped in an invalid location
- Supports keyboard-based component addition via Enter key
```

## 4. Design System Specifications

### 4.1. Color Palette

Provide Lovable with a consistent color palette:

```
Primary Colors:
- Primary Blue: #2563eb
- Primary Blue Dark: #1d4ed8
- Primary Blue Light: #3b82f6

Secondary Colors:
- Gray 50: #f9fafb
- Gray 100: #f3f4f6
- Gray 200: #e5e7eb
- Gray 500: #6b7280
- Gray 700: #374151
- Gray 900: #111827

Accent Colors:
- Success Green: #10b981
- Warning Orange: #f59e0b
- Error Red: #ef4444
- Info Blue: #06b6d4
```

### 4.2. Typography

```
Font Family: Inter, system-ui, sans-serif

Heading Sizes:
- H1: text-4xl (36px) font-bold
- H2: text-3xl (30px) font-semibold
- H3: text-2xl (24px) font-semibold
- H4: text-xl (20px) font-medium

Body Text:
- Large: text-lg (18px)
- Regular: text-base (16px)
- Small: text-sm (14px)
- Extra Small: text-xs (12px)
```

### 4.3. Spacing and Layout

```
Spacing Scale (Tailwind):
- xs: 0.5rem (8px)
- sm: 0.75rem (12px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

Border Radius:
- Small: rounded-md (6px)
- Medium: rounded-lg (8px)
- Large: rounded-xl (12px)
```

## 5. Component-Specific Guidance

### 5.1. Design Canvas Components

**Key Requirements:**
- High-performance rendering for 50+ components
- Smooth zoom and pan interactions
- Precise connection line drawing
- Grid snapping for component placement
- Selection and multi-selection support

**Prompting Example:**
```
Create a high-performance DesignCanvas component using HTML5 Canvas or SVG that:
- Renders system components as rounded rectangles with icons and labels
- Supports smooth zoom (0.25x to 2x) with mouse wheel
- Enables pan with mouse drag when not interacting with components
- Draws connection lines as curved Bezier paths between components
- Highlights selected components with a blue border
- Supports multi-selection with Ctrl+click or drag selection box
- Maintains 60fps performance with up to 100 components
```

### 5.2. Property Panel Components

**Key Requirements:**
- Dynamic form generation based on component type
- Real-time validation and feedback
- Collapsible sections for organization
- Support for various input types

**Prompting Example:**
```
Create a PropertyPanel component that:
- Displays a dynamic form based on the selected component type
- Groups properties into collapsible sections (Basic, Advanced, Resilience)
- Supports text inputs, number inputs, dropdowns, and toggle switches
- Shows validation errors inline with red text and icons
- Updates the design state in real-time as values change
- Includes a reset button to restore default values
- Is fully keyboard navigable with proper tab order
```

### 5.3. Metrics Dashboard Components

**Key Requirements:**
- Real-time chart updates
- Multiple chart types (line, bar, gauge)
- Responsive layout for different screen sizes
- Interactive legends and tooltips

**Prompting Example:**
```
Create a MetricsDashboard component using Chart.js or Recharts that:
- Displays 4-6 key metrics in a responsive grid layout
- Includes line charts for latency and throughput over time
- Shows gauge charts for current CPU and memory usage
- Updates charts in real-time as new data arrives via WebSocket
- Includes interactive tooltips showing exact values on hover
- Adapts to mobile by stacking charts vertically
- Uses consistent colors from our design system
```

## 6. State Management Integration

### 6.1. Redux/Zustand Integration

When working with state management, provide clear guidance:

```
Integrate this component with our Redux store by:
- Connecting to the designSlice for design-related state
- Using useSelector to read current design data
- Dispatching actions via useDispatch for state updates
- Following the established action naming convention (verb + noun)
- Implementing optimistic updates for better UX
```

### 6.2. API Integration

For components that interact with APIs:

```
Implement API integration that:
- Uses our established apiClient with proper error handling
- Shows loading states during API calls
- Displays user-friendly error messages
- Implements retry logic for failed requests
- Caches responses where appropriate
```

## 7. Performance Optimization Guidance

### 7.1. Rendering Performance

```
Optimize component performance by:
- Using React.memo for components that receive stable props
- Implementing useMemo for expensive calculations
- Using useCallback for event handlers passed to child components
- Virtualizing large lists with react-window or similar
- Debouncing user input for search and filter operations
```

### 7.2. Bundle Size Optimization

```
Keep bundle size minimal by:
- Using dynamic imports for large components or libraries
- Implementing code splitting at the route level
- Tree-shaking unused library code
- Optimizing images and using appropriate formats (WebP, AVIF)
- Lazy loading non-critical components
```

## 8. Testing and Quality Assurance

### 8.1. Component Testing

```
Ensure components are testable by:
- Writing unit tests for component logic and rendering
- Using React Testing Library for user interaction testing
- Mocking external dependencies and API calls
- Testing accessibility with jest-axe or similar tools
- Implementing visual regression tests for critical components
```

### 8.2. Cross-Browser Compatibility

```
Ensure cross-browser compatibility by:
- Testing in Chrome, Firefox, Safari, and Edge
- Using CSS features with appropriate fallbacks
- Polyfilling JavaScript features for older browsers
- Testing responsive behavior across different devices
- Validating accessibility across different screen readers
```

## 9. Common Pitfalls and Solutions

### 9.1. Avoiding Over-Engineering

**Problem:** Creating overly complex components that are hard to maintain.
**Solution:** Start simple and add complexity incrementally. Focus on core functionality first.

### 9.2. Inconsistent Styling

**Problem:** Components that don't follow the design system.
**Solution:** Always reference the design system and use established utility classes.

### 9.3. Poor Performance

**Problem:** Components that cause performance issues.
**Solution:** Profile components regularly and optimize based on actual usage patterns.

## 10. Example Interaction Flow

Here's an example of how to work with Lovable on a complex component:

**Initial Request:**
```
Create a SimulationControls component for starting and stopping simulations that includes play, pause, stop, and reset buttons with appropriate icons and loading states.
```

**Follow-up Refinements:**
```
1. Add a progress bar showing simulation completion percentage
2. Include a time display showing elapsed simulation time
3. Add keyboard shortcuts (Space for play/pause, Esc for stop)
4. Implement button state management based on simulation status
5. Add smooth transitions between different states
```

**Final Polish:**
```
1. Add subtle hover animations to buttons
2. Implement proper focus indicators for accessibility
3. Add tooltips explaining each button's function
4. Ensure the component works well in both light and dark themes
5. Test and refine responsive behavior on mobile devices
```

By following this guidance, interactions with Lovable will be more productive and result in higher-quality frontend components that align with Architech's design goals and technical requirements.

---

**Author:** Manus AI

**Date:** 2025-07-19

