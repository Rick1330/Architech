# Development Guide

This guide covers everything you need to know to develop, contribute to, and maintain the Architech frontend application.

## Getting Started

### Prerequisites
- **Node.js**: Version 18+ (recommended: use nvm for version management)
- **npm**: Version 9+ (comes with Node.js)
- **Git**: For version control
- **VS Code**: Recommended IDE with suggested extensions

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd architech-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_WS_BASE_URL=ws://localhost:8000/ws
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Development Workflow

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── nodes/           # Canvas node components
│   ├── edges/           # Canvas edge components
│   └── auth/            # Authentication components
├── features/            # Feature-based modules
│   ├── simulation-canvas/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── component-palette/
│   └── property-panel/
├── hooks/               # Global custom hooks
├── lib/                 # Utility libraries
│   ├── api/            # API client
│   ├── design/         # Design utilities
│   └── utils.ts        # General utilities
├── pages/              # Route components
├── stores/             # Zustand stores
└── types/              # Global TypeScript types
```

### Coding Standards

#### TypeScript Best Practices

1. **Use strict TypeScript configuration**
   ```typescript
   // Always define interfaces for props
   interface ComponentProps {
     title: string;
     onSelect?: (id: string) => void;
     children?: React.ReactNode;
   }
   
   // Use type assertions sparingly
   const element = document.getElementById('canvas') as HTMLCanvasElement;
   
   // Prefer union types over enums when appropriate
   type Status = 'idle' | 'loading' | 'success' | 'error';
   ```

2. **Component definitions**
   ```typescript
   // Use function declarations for components
   function ComponentCard({ title, onSelect }: ComponentProps) {
     return <div>{title}</div>;
   }
   
   // Export components with proper typing
   export { ComponentCard };
   export type { ComponentProps };
   ```

#### React Patterns

1. **Custom hooks for business logic**
   ```typescript
   function useComponentSelection() {
     const [selectedId, setSelectedId] = useState<string | null>(null);
     
     const selectComponent = useCallback((id: string) => {
       setSelectedId(id);
     }, []);
     
     return { selectedId, selectComponent };
   }
   ```

2. **Memoization for performance**
   ```typescript
   const ComponentList = memo(function ComponentList({ items }) {
     return (
       <div>
         {items.map(item => (
           <ComponentCard key={item.id} {...item} />
         ))}
       </div>
     );
   });
   ```

3. **Error boundaries for resilience**
   ```typescript
   function FeatureErrorBoundary({ children }: { children: React.ReactNode }) {
     return (
       <ErrorBoundary fallback={<ErrorFallback />}>
         {children}
       </ErrorBoundary>
     );
   }
   ```

#### State Management with Zustand

1. **Store organization**
   ```typescript
   interface ArchitectStore {
     // State
     nodes: Node[];
     selectedNodeId: string | null;
     
     // Actions
     addNode: (node: Node) => void;
     selectNode: (id: string | null) => void;
   }
   
   const useArchitectStore = create<ArchitectStore>((set, get) => ({
     nodes: [],
     selectedNodeId: null,
     
     addNode: (node) => set((state) => ({
       nodes: [...state.nodes, node]
     })),
     
     selectNode: (id) => set({ selectedNodeId: id }),
   }));
   ```

2. **Store slicing for large stores**
   ```typescript
   const createCanvasSlice = (set, get) => ({
     nodes: [],
     edges: [],
     addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
   });
   
   const useArchitectStore = create((...args) => ({
     ...createCanvasSlice(...args),
     ...createSimulationSlice(...args),
   }));
   ```

### Component Development

#### UI Component Guidelines

1. **Use the design system**
   ```typescript
   // ✅ Good: Use semantic tokens
   <Button variant="primary" size="lg">
     Save Project
   </Button>
   
   // ❌ Bad: Direct styling
   <button className="bg-blue-500 px-4 py-2">
     Save Project
   </button>
   ```

2. **Component composition**
   ```typescript
   // Create compound components for complex UI
   function PropertyPanel({ children }: { children: React.ReactNode }) {
     return <div className="property-panel">{children}</div>;
   }
   
   PropertyPanel.Header = function Header({ title }: { title: string }) {
     return <header className="property-panel-header">{title}</header>;
   };
   
   PropertyPanel.Content = function Content({ children }: { children: React.ReactNode }) {
     return <div className="property-panel-content">{children}</div>;
   };
   ```

3. **Accessibility first**
   ```typescript
   function ComponentCard({ component, onSelect }) {
     return (
       <Card
         role="button"
         tabIndex={0}
         aria-label={`Select ${component.name} component`}
         onClick={() => onSelect(component.id)}
         onKeyDown={(e) => {
           if (e.key === 'Enter' || e.key === ' ') {
             onSelect(component.id);
           }
         }}
       >
         {/* Component content */}
       </Card>
     );
   }
   ```

#### Canvas Components

1. **Node component structure**
   ```typescript
   interface NodeProps {
     data: NodeData;
     selected?: boolean;
   }
   
   function DatabaseNode({ data, selected }: NodeProps) {
     const { metrics } = useNodeMetrics(data.id);
     const { onConnect } = useNodeConnection();
     
     return (
       <NodeContainer selected={selected}>
         <NodeHeader title={data.label} icon={DatabaseIcon} />
         <NodeBody>
           <MetricsDisplay metrics={metrics} />
           <ConnectionPoints onConnect={onConnect} />
         </NodeBody>
       </NodeContainer>
     );
   }
   ```

2. **Edge component patterns**
   ```typescript
   function EnhancedArchitectEdge({ id, source, target, data }) {
     const { isActive, traffic } = useEdgeMetrics(id);
     
     return (
       <BaseEdge
         id={id}
         path={getEdgePath({ source, target })}
         style={{
           stroke: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
           strokeWidth: Math.max(1, traffic / 10),
         }}
       />
     );
   }
   ```

### API Integration

#### API Client Usage

1. **Authentication flow**
   ```typescript
   // Login
   const { data: authData } = await apiClient.login(email, password);
   apiClient.setAuthToken(authData.access_token);
   
   // Use authenticated endpoints
   const projects = await apiClient.getProjects();
   ```

2. **Error handling**
   ```typescript
   async function fetchProjects() {
     try {
       const projects = await apiClient.getProjects();
       return projects;
     } catch (error) {
       if (error.code === 'AUTHENTICATION_REQUIRED') {
         // Redirect to login
         router.push('/login');
       } else {
         // Show error message
         toast.error(error.message);
       }
       throw error;
     }
   }
   ```

3. **React Query integration**
   ```typescript
   function useProjects() {
     return useQuery({
       queryKey: ['projects'],
       queryFn: () => apiClient.getProjects(),
       staleTime: 5 * 60 * 1000, // 5 minutes
     });
   }
   ```

### WebSocket Integration

1. **Connection management**
   ```typescript
   function useWebSocketConnection(sessionId: string) {
     const [isConnected, setIsConnected] = useState(false);
     const wsClient = useRef<WebSocketClient | null>(null);
     
     useEffect(() => {
       if (sessionId) {
         wsClient.current = new WebSocketClient();
         wsClient.current.connect(`/ws/${sessionId}`, authToken);
         setIsConnected(true);
       }
       
       return () => {
         wsClient.current?.disconnect();
         setIsConnected(false);
       };
     }, [sessionId]);
     
     return { isConnected, wsClient: wsClient.current };
   }
   ```

2. **Event handling**
   ```typescript
   function useSimulationEvents(sessionId: string) {
     const updateMetrics = useArchitectStore(state => state.updateNodeMetrics);
     const addEvent = useArchitectStore(state => state.addSimulationEvent);
     
     const { wsClient } = useWebSocketConnection(sessionId);
     
     useEffect(() => {
       if (!wsClient) return;
       
       wsClient.subscribe('component_metrics', (data) => {
         updateMetrics(data.component_id, data.metrics);
       });
       
       wsClient.subscribe('component_event', (data) => {
         addEvent(data);
       });
     }, [wsClient, updateMetrics, addEvent]);
   }
   ```

## Testing

### Unit Testing

1. **Component testing**
   ```typescript
   import { render, screen, fireEvent } from '@testing-library/react';
   import { ComponentCard } from './ComponentCard';
   
   describe('ComponentCard', () => {
     it('calls onSelect when clicked', () => {
       const onSelect = jest.fn();
       const component = { id: '1', name: 'API Gateway', type: 'api-gateway' };
       
       render(<ComponentCard component={component} onSelect={onSelect} />);
       
       fireEvent.click(screen.getByRole('button'));
       expect(onSelect).toHaveBeenCalledWith('1');
     });
   });
   ```

2. **Hook testing**
   ```typescript
   import { renderHook, act } from '@testing-library/react';
   import { useComponentSelection } from './useComponentSelection';
   
   describe('useComponentSelection', () => {
     it('updates selected component', () => {
       const { result } = renderHook(() => useComponentSelection());
       
       act(() => {
         result.current.selectComponent('comp-1');
       });
       
       expect(result.current.selectedId).toBe('comp-1');
     });
   });
   ```

3. **Store testing**
   ```typescript
   import { renderHook, act } from '@testing-library/react';
   import { useArchitectStore } from './useArchitectStore';
   
   describe('ArchitectStore', () => {
     beforeEach(() => {
       useArchitectStore.getState().reset();
     });
     
     it('adds node correctly', () => {
       const { result } = renderHook(() => useArchitectStore());
       const node = { id: '1', type: 'service', position: { x: 0, y: 0 } };
       
       act(() => {
         result.current.addNode(node);
       });
       
       expect(result.current.nodes).toContain(node);
     });
   });
   ```

### Integration Testing

1. **API integration**
   ```typescript
   import { rest } from 'msw';
   import { setupServer } from 'msw/node';
   import { apiClient } from '@/lib/api/client';
   
   const server = setupServer(
     rest.get('/api/v1/projects', (req, res, ctx) => {
       return res(ctx.json({ data: [{ id: '1', name: 'Test Project' }] }));
     })
   );
   
   beforeAll(() => server.listen());
   afterEach(() => server.resetHandlers());
   afterAll(() => server.close());
   
   describe('API Client', () => {
     it('fetches projects successfully', async () => {
       const projects = await apiClient.getProjects();
       expect(projects).toHaveLength(1);
       expect(projects[0].name).toBe('Test Project');
     });
   });
   ```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test ComponentCard.test.tsx
```

## Performance

### Optimization Strategies

1. **Component optimization**
   ```typescript
   // Memoize expensive components
   const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
     const processedData = useMemo(() => processLargeData(data), [data]);
     return <div>{processedData}</div>;
   });
   
   // Optimize callback functions
   const handleClick = useCallback((id: string) => {
     onSelect(id);
   }, [onSelect]);
   ```

2. **Canvas optimization**
   ```typescript
   // Viewport culling for large canvases
   function useViewportNodes(nodes: Node[], viewport: Viewport) {
     return useMemo(() => {
       return nodes.filter(node => isNodeInViewport(node, viewport));
     }, [nodes, viewport]);
   }
   
   // Debounce frequent updates
   const debouncedUpdatePosition = useMemo(
     () => debounce(updateNodePosition, 16), // 60fps
     [updateNodePosition]
   );
   ```

3. **State optimization**
   ```typescript
   // Selective store subscriptions
   const selectedNode = useArchitectStore(state => 
     state.nodes.find(n => n.id === state.selectedNodeId)
   );
   
   // Use shallow comparison for arrays
   const nodes = useArchitectStore(state => state.nodes, shallow);
   ```

### Performance Monitoring

1. **React Profiler**
   ```typescript
   function ProfiledApp() {
     return (
       <Profiler id="App" onRender={onRenderCallback}>
         <App />
       </Profiler>
     );
   }
   
   function onRenderCallback(id, phase, actualDuration) {
     if (actualDuration > 16) { // > 16ms is potentially slow
       console.warn(`Slow render: ${id} took ${actualDuration}ms`);
     }
   }
   ```

2. **Bundle analysis**
   ```bash
   npm run build:analyze
   ```

## Debugging

### Development Tools

1. **React DevTools**: Browser extension for inspecting React components
2. **Redux DevTools**: For Zustand state inspection (with devtools middleware)
3. **React Query DevTools**: For API cache inspection

### Common Issues

1. **State updates not triggering re-renders**
   ```typescript
   // ❌ Mutating state
   const addNode = (node) => {
     state.nodes.push(node); // This won't trigger re-render
   };
   
   // ✅ Immutable update
   const addNode = (node) => set((state) => ({
     nodes: [...state.nodes, node]
   }));
   ```

2. **Memory leaks with subscriptions**
   ```typescript
   useEffect(() => {
     const unsubscribe = store.subscribe(callback);
     return unsubscribe; // Always cleanup subscriptions
   }, []);
   ```

3. **Stale closures in useCallback**
   ```typescript
   // ❌ Stale closure
   const handleClick = useCallback(() => {
     console.log(count); // Always logs initial count
   }, []); // Missing dependency
   
   // ✅ Fresh closure
   const handleClick = useCallback(() => {
     console.log(count);
   }, [count]); // Include dependencies
   ```

## Build and Deployment

### Build Process

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### Environment Configuration

1. **Development (.env.local)**
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_WS_BASE_URL=ws://localhost:8000/ws
   ```

2. **Production (.env.production)**
   ```env
   VITE_API_BASE_URL=https://api.architech.dev/api/v1
   VITE_WS_BASE_URL=wss://api.architech.dev/ws
   ```

### Docker Development

```bash
# Build development image
docker build -f Dockerfile.dev -t architech-frontend:dev .

# Run with docker-compose
docker-compose -f docker-compose.frontend.yml up
```

## Contributing

### Contribution Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-component-type
   ```

2. **Make changes following coding standards**
3. **Write/update tests**
4. **Update documentation**
5. **Submit pull request**

### Code Review Checklist

- [ ] Code follows TypeScript/React best practices
- [ ] Components are properly typed
- [ ] Tests are included and passing
- [ ] Performance considerations addressed
- [ ] Accessibility guidelines followed
- [ ] Documentation updated
- [ ] No console errors or warnings

---

For specific feature implementation guides, see the respective feature documentation in the [Features](../features/) directory.