# Updated Architech Frontend Prompt for Lovable.dev

## Critical Implementation Updates Required

Based on backend analysis and React Flow best practices, please implement the following updates to the Architech frontend:

### 1. React Flow Implementation Fixes

**CRITICAL:** Fix React Flow imports throughout the codebase:

```jsx
// ❌ INCORRECT (currently used)
import ReactFlow, { ... } from '@xyflow/react';

// ✅ CORRECT (required fix)
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
```

**Required Changes:**
- Update all React Flow imports in `src/components/ArchitectCanvas.tsx`
- Fix any other React Flow related components
- Ensure `@xyflow/react/dist/style.css` is properly imported
- Remove transitions and hover effects from nodes (per guidelines)

### 2. Backend API Integration Updates

**Update API Client (`src/lib/api/client.ts`):**
```typescript
// Update endpoint structure to match backend:
const endpoints = {
  // User Service (via API Gateway)
  users: {
    login: '/users/login',        // ✅ Correct
    register: '/users/register',  // ✅ Correct  
    me: '/users/me'              // ✅ Correct
  },
  
  // Design Service (via API Gateway) 
  designs: {
    list: '/designs',                           // ❌ Fix: should support project filtering
    create: '/designs',                         // ✅ Correct
    get: (id: string) => `/designs/${id}`,      // ✅ Correct
    update: (id: string) => `/designs/${id}`,   // ✅ Correct
    delete: (id: string) => `/designs/${id}`,   // ✅ Correct
    
    // ❌ MISSING: Add version management
    createVersion: (id: string) => `/designs/${id}/versions`,
    
    // ❌ MISSING: Add project-specific design listing  
    byProject: (projectId: string) => `/designs/project/${projectId}`
  },
  
  // ❌ MISSING: Component Management endpoints
  components: {
    list: '/components',
    create: '/components',
    get: (id: string) => `/components/${id}`,
    update: (id: string) => `/components/${id}`,
    delete: (id: string) => `/components/${id}`
  },
  
  // Simulation endpoints (via API Gateway)
  simulations: {
    create: '/simulations',                                    // ✅ Correct
    get: (id: string) => `/simulations/${id}`,                 // ✅ Correct
    start: (id: string) => `/simulations/${id}/start`,         // ✅ Correct
    stop: (id: string) => `/simulations/${id}/stop`,           // ✅ Correct
    
    // ❌ MISSING: Add session management
    sessions: '/simulations/sessions',
    deleteSession: (id: string) => `/simulations/${id}`
  }
};
```

### 3. WebSocket Integration Fixes

**Update WebSocket Client (`src/lib/websocket/client.ts`):**
```typescript
// ✅ Correct endpoint pattern (already implemented)
const wsEndpoint = `ws://localhost:8000/api/v1/simulations/${sessionId}/ws`;

// ❌ MISSING: Add authentication to WebSocket connection
class SimulationWebSocketClient {
  connect(sessionId: string, authToken: string) {
    // Add auth token as query parameter or header
    const wsUrl = `${this.baseUrl}/simulations/${sessionId}/ws?token=${authToken}`;
    this.ws = new WebSocket(wsUrl);
  }
  
  // ✅ Handle these message types (verify implementation):
  handleMessage(message: {
    type: 'simulation_started' | 'simulation_stopped' | 'simulation_event' | 'simulation_metric';
    session_id: string;
    event?: SimulationEvent;
    metric?: SimulationMetric;
  }) {
    // Implementation should update Zustand store
  }
}
```

### 4. Design Data Serialization Critical Updates

**Fix Design Serializer (`src/lib/design/serializer.ts`):**
```typescript
interface BackendDesignData {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      name: string;
      properties: Record<string, any>; // Component-specific properties
      // ... other component data
    };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
    data?: {
      protocol?: string;
      latency?: number;
      bandwidth?: number;
      errorRate?: number;
    };
  }>;
  viewport: { x: number; y: number; zoom: number };
  metadata?: {
    version: string;
    created_at: string;
    updated_at: string;
  };
}

// ❌ CRITICAL: Update serializeDesign to match backend expectations
export function serializeDesign(nodes: Node[], edges: Edge[], viewport: any): BackendDesignData {
  return {
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type || 'default',
      position: node.position,
      data: {
        name: node.data?.name || node.data?.label || `${node.type}_${node.id}`,
        properties: node.data?.properties || {},
        ...node.data
      }
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      data: edge.data || {}
    })),
    viewport,
    metadata: {
      version: '1.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
}
```

### 5. Component Property Panel Enhancement

**Critical Enhancement for `src/components/EnhancedPropertyPanel.tsx`:**
```typescript
// ❌ MISSING: Full JSON Schema support for dynamic forms
interface ComponentSchema {
  properties_schema: JSONSchema; // From backend
  default_properties: Record<string, any>; // From backend
}

function EnhancedPropertyPanel() {
  // ✅ Already has basic property rendering
  // ❌ MISSING: JSON Schema-driven form generation
  
  const generateFormFromSchema = (schema: JSONSchema, values: Record<string, any>) => {
    // Generate form fields based on JSON Schema
    // Support for: string, number, boolean, select, textarea types
    // Validation based on schema rules
  };
  
  return (
    <div>
      {/* Dynamic form generation based on component's properties_schema */}
      {selectedComponent?.properties_schema && (
        <DynamicForm 
          schema={selectedComponent.properties_schema}
          values={selectedComponent.properties}
          onChange={handlePropertyChange}
        />
      )}
    </div>
  );
}
```

### 6. Node Component Updates Required

**Create proper node components with backend integration:**

```typescript
// src/components/nodes/GenericServiceNode.tsx
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export const GenericServiceNode = memo(({ data, selected }) => {
  const { name, instanceCount, cpu, memory, status } = data.properties || {};
  
  return (
    <div className={`generic-service-node ${status || 'idle'} ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      
      <div className="node-header">
        <div className="node-icon">⚙️</div>
        <div className="node-title">{name || data.label}</div>
      </div>
      
      <div className="node-body">
        <div className="property">Instances: {instanceCount || 1}</div>
        <div className="property">CPU: {cpu || 0.5} cores</div>
        <div className="property">Memory: {memory || 512}MB</div>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

// Similar implementations needed for:
// - DatabaseNode
// - MessageQueueNode  
// - LoadBalancerNode
// - CacheNode
// - APIGatewayNode
```

### 7. Zustand Store Integration Updates

**Update Store (`src/stores/useArchitectStore.ts`):**
```typescript
interface ArchitectStore {
  // ✅ Existing state management is good
  
  // ❌ MISSING: Add component schema management
  componentSchemas: Record<string, ComponentSchema>;
  setComponentSchemas: (schemas: Record<string, ComponentSchema>) => void;
  
  // ❌ MISSING: Enhanced design operations
  saveDesign: (projectId: string) => Promise<void>;
  loadDesign: (designId: string) => Promise<void>;
  createDesignVersion: (designId: string) => Promise<void>;
  
  // ❌ MISSING: Component management
  createComponent: (component: ComponentSchema) => Promise<void>;
  updateComponent: (id: string, updates: Partial<ComponentSchema>) => Promise<void>;
}
```

### 8. Environment Configuration

**Update environment variables:**
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_BASE_URL=ws://localhost:8000/api/v1

# .env.production  
VITE_API_BASE_URL=https://api.architech.com/api/v1
VITE_WS_BASE_URL=wss://api.architech.com/api/v1
```

### 9. Testing Requirements

**Add comprehensive tests:**
```typescript
// src/lib/api/__tests__/client.test.ts - ✅ Already exists, enhance with:
- Component CRUD operations
- Design version management  
- WebSocket message handling
- Error scenarios

// src/components/__tests__/ArchitectCanvas.test.tsx - ❌ MISSING
- Node creation and positioning
- Edge connections
- Design serialization/deserialization
- Real-time updates during simulation

// src/hooks/__tests__/useSimulation.test.tsx - ✅ Already exists, enhance with:
- WebSocket authentication
- Message type handling
- Error recovery scenarios
```

### 10. Docker & CI/CD Enhancements

**Verify Docker setup:**
```dockerfile
# Dockerfile - ✅ Already exists, ensure:
- Multi-stage build optimization
- Proper static asset serving
- Environment variable injection
- Health checks

# docker-compose.yml - Add frontend service networking:
services:
  frontend:
    depends_on:
      - api-gateway
    environment:
      - VITE_API_BASE_URL=http://api-gateway:8000/api/v1
      - VITE_WS_BASE_URL=ws://simulation-orchestration:8000/api/v1
```

**CI/CD Pipeline enhancements:**
```yaml
# .github/workflows/frontend-ci.yml - ✅ Already exists, ensure:
- TypeScript compilation
- React Flow import validation  
- Integration test execution
- E2E testing with backend services
```

## Implementation Priority

1. **HIGH PRIORITY:**
   - Fix React Flow imports (breaks current functionality)
   - Update API endpoints to match backend
   - Enhance design serialization for backend compatibility

2. **MEDIUM PRIORITY:**
   - Complete WebSocket authentication
   - Implement JSON Schema-driven property panels
   - Create specialized node components

3. **LOW PRIORITY:**
   - Enhance testing coverage
   - Optimize Docker configuration
   - Add component management features

## Expected Outcome

After implementing these updates, the frontend will:
- ✅ Properly integrate with all backend services
- ✅ Handle real-time simulation data correctly  
- ✅ Support dynamic component property configuration
- ✅ Maintain compatibility with existing React Flow patterns
- ✅ Provide robust error handling and testing coverage

Please implement these changes systematically, starting with the high-priority items.
