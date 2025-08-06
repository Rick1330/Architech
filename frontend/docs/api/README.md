# API Documentation

This document provides comprehensive information about the Architech backend API, including authentication, endpoints, and integration patterns.

## Base URL

```
Production: https://api.architech.dev/api/v1
Development: http://localhost:8000/api/v1
```

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",
  "password": "secure-password"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

## Projects API

### List Projects
```http
GET /projects
Authorization: Bearer <token>
```

### Get Project
```http
GET /projects/{project_id}
Authorization: Bearer <token>
```

### Create Project
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Architecture",
  "description": "System architecture for microservices"
}
```

### Update Project
```http
PUT /projects/{project_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Architecture",
  "description": "Updated description"
}
```

### Delete Project
```http
DELETE /projects/{project_id}
Authorization: Bearer <token>
```

## Designs API

### List Designs
```http
GET /projects/{project_id}/designs
Authorization: Bearer <token>
```

### Get Design
```http
GET /designs/{design_id}
Authorization: Bearer <token>
```

### Create Design
```http
POST /projects/{project_id}/designs
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Main Architecture",
  "canvas_data": {
    "nodes": [...],
    "edges": [...]
  }
}
```

### Update Design
```http
PUT /designs/{design_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Design",
  "canvas_data": {
    "nodes": [...],
    "edges": [...]
  }
}
```

## Simulation API

### Create Simulation Session
```http
POST /simulations
Authorization: Bearer <token>
Content-Type: application/json

{
  "design_id": "design-uuid",
  "name": "Load Test Simulation"
}
```

### Start Simulation
```http
POST /simulations/{session_id}/start
Authorization: Bearer <token>
```

### Stop Simulation
```http
POST /simulations/{session_id}/stop
Authorization: Bearer <token>
```

### Get Simulation Status
```http
GET /simulations/{session_id}
Authorization: Bearer <token>
```

## Component Types API

### List Component Types
```http
GET /component-types
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "api-gateway",
      "name": "API Gateway",
      "category": "infrastructure",
      "icon": "gateway",
      "properties_schema": {
        "type": "object",
        "properties": {
          "port": {"type": "number", "default": 80},
          "ssl_enabled": {"type": "boolean", "default": true}
        }
      },
      "default_properties": {
        "port": 80,
        "ssl_enabled": true
      }
    }
  ]
}
```

## AI Recommendations API

### Get AI Recommendations
```http
POST /ai/recommendations
Authorization: Bearer <token>
Content-Type: application/json

{
  "design_id": "design-uuid",
  "context": "performance optimization"
}
```

## Observability API

### Get Metrics
```http
GET /observability/metrics
Authorization: Bearer <token>
Query Parameters:
- session_id: Simulation session ID
- component_id: Specific component ID (optional)
- start_time: ISO 8601 timestamp
- end_time: ISO 8601 timestamp
- metric_type: cpu, memory, latency, throughput (optional)
```

### Get Logs
```http
GET /observability/logs
Authorization: Bearer <token>
Query Parameters:
- session_id: Simulation session ID
- component_id: Specific component ID (optional)
- start_time: ISO 8601 timestamp
- end_time: ISO 8601 timestamp
- level: debug, info, warn, error (optional)
- limit: Number of logs to return (default: 100)
```

## WebSocket Events

Connect to the WebSocket endpoint for real-time updates:

```
wss://api.architech.dev/ws/{session_id}?token=<jwt-token>
```

### Event Types

#### Simulation Status
```json
{
  "type": "simulation_status",
  "data": {
    "status": "running",
    "elapsed_time": 150,
    "components_active": 12
  }
}
```

#### Component Metrics
```json
{
  "type": "component_metrics",
  "data": {
    "component_id": "comp-uuid",
    "metrics": {
      "cpu_usage": 75.5,
      "memory_usage": 512,
      "latency": 45
    },
    "timestamp": "2024-03-08T10:30:00Z"
  }
}
```

#### Component Event
```json
{
  "type": "component_event",
  "data": {
    "component_id": "comp-uuid",
    "event_type": "request_received",
    "details": {
      "method": "GET",
      "path": "/api/users",
      "status_code": 200
    },
    "timestamp": "2024-03-08T10:30:00Z"
  }
}
```

## Error Handling

All API errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Common Error Codes
- `AUTHENTICATION_REQUIRED`: Missing or invalid token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **General API**: 100 requests per minute per user
- **WebSocket connections**: 10 concurrent connections per user

## SDK Integration

### Frontend API Client
```typescript
import { apiClient } from '@/lib/api/client';

// Authentication
await apiClient.login('user@example.com', 'password');

// Projects
const projects = await apiClient.getProjects();
const project = await apiClient.createProject({
  name: 'My Project',
  description: 'Project description'
});

// Designs
const design = await apiClient.createDesign(project.id, {
  name: 'Main Design',
  canvas_data: canvasData
});

// Simulation
const session = await apiClient.createSimulationSession({
  design_id: design.id,
  name: 'Test Simulation'
});
await apiClient.startSimulation(session.id);
```

## Testing

### API Testing with curl

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# Get projects
curl -X GET http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer <token>"
```

### Environment Variables

```bash
# Development
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_BASE_URL=ws://localhost:8000/ws

# Production
VITE_API_BASE_URL=https://api.architech.dev/api/v1
VITE_WS_BASE_URL=wss://api.architech.dev/ws
```

---

For more detailed examples and integration patterns, see the [Development Guide](../development/README.md).