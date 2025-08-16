# Quick Start Guide

Get up and running with Architech in minutes! This guide will walk you through setting up the development environment and creating your first architecture diagram.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git** for version control

## Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd architech-frontend

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_BASE_URL=ws://localhost:8000/ws
```

### 3. Start Development Server

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

## First Steps

### 1. Create an Account

1. Click the "User" button in the top-right corner
2. Select "Sign Up" from the dropdown
3. Fill in your details and create an account
4. Sign in with your new credentials

### 2. Create Your First Project

1. Click "New Project" in the project switcher
2. Enter a project name (e.g., "My First Architecture")
3. Add a description
4. Click "Create"

### 3. Add Components to Canvas

1. **Browse the Component Palette** (left sidebar)
   - Infrastructure: Servers, load balancers, databases
   - Services: APIs, microservices, functions
   - Data: Caches, queues, storage systems

2. **Drag and Drop Components**
   - Drag an "API Gateway" from the palette to the canvas
   - Add a "Database" component
   - Add a "Cache" component

3. **Connect Components**
   - Click and drag from the connection point of one component to another
   - Create a flow: API Gateway → Database
   - Add another connection: API Gateway → Cache

### 4. Configure Component Properties

1. **Select a Component**
   - Click on any component to select it
   - The Property Panel opens on the right

2. **Edit Properties**
   - **Configuration Tab**: Modify settings like port numbers, replica counts
   - **Metrics Tab**: View real-time performance data (during simulation)
   - **Logs Tab**: Monitor component-specific logs

3. **Example Configuration**
   ```
   API Gateway:
   - Port: 80
   - SSL Enabled: true
   - Rate Limit: 1000 req/min
   
   Database:
   - Type: PostgreSQL
   - Max Connections: 100
   - Connection String: postgresql://localhost:5432/mydb
   ```

### 5. Run Your First Simulation

1. **Start Simulation**
   - Click the "Play" button in the simulation controls
   - Watch as components come alive with status indicators

2. **Monitor Performance**
   - Green indicators: Healthy components
   - Yellow indicators: Warning states
   - Red indicators: Error conditions
   - Animated edges: Data flow between components

3. **View Metrics**
   - Select components to see real-time metrics
   - CPU usage, memory consumption, latency
   - Request/response patterns

### 6. Save Your Work

1. **Auto-save**: Changes are automatically saved as you work
2. **Manual Save**: Click the save icon or use `Ctrl+S`
3. **Version History**: Access previous versions from the project menu

## Key Features Overview

### 🎨 Visual Canvas
- Drag-and-drop interface for designing architectures
- Real-time visual feedback and status indicators
- Zoom, pan, and organize your components

### 🧩 Component Library
- Pre-built architectural components
- Searchable and categorized
- Customizable properties for each component type

### ⚡ Real-time Simulation
- Live simulation of system behavior
- Performance metrics and monitoring
- Event tracking and logging

### 🔧 Property Management
- Dynamic property editing
- Real-time validation
- Component-specific configurations

## Common Workflows

### Creating a Microservices Architecture

1. **Add Core Services**
   ```
   API Gateway → Service A → Database A
                ↓
               Service B → Database B
                ↓
               Message Queue
   ```

2. **Configure Load Balancing**
   - Add Load Balancer before services
   - Set replica counts for horizontal scaling

3. **Add Monitoring**
   - Include monitoring services
   - Configure metrics collection

### Building a Caching Layer

1. **Add Cache Components**
   - Redis for session storage
   - Memcached for application cache

2. **Configure Cache Strategy**
   - Set TTL values
   - Configure eviction policies

3. **Connect to Services**
   - Route read requests through cache
   - Configure cache invalidation

## Tips for Success

### 🎯 Best Practices

1. **Start Simple**: Begin with a basic architecture and add complexity gradually
2. **Use Naming Conventions**: Give meaningful names to components and connections
3. **Group Related Components**: Use visual organization to represent system boundaries
4. **Monitor Performance**: Run simulations regularly to identify bottlenecks

### 🚀 Keyboard Shortcuts

- `Ctrl/Cmd + S`: Save project
- `Space + Drag`: Pan canvas
- `Ctrl/Cmd + Scroll`: Zoom in/out
- `Delete`: Remove selected component/connection
- `Esc`: Deselect all

### 🔍 Troubleshooting

**Components won't connect?**
- Ensure connection points are compatible
- Check that both components support the connection type

**Simulation not starting?**
- Verify all components are properly configured
- Check for validation errors in the property panel

**Performance issues?**
- Reduce the number of visible components
- Use the zoom feature to focus on specific areas

## Next Steps

Now that you're familiar with the basics, explore these advanced features:

1. **[Component Customization](./features/components.md)** - Create custom component types
2. **[Advanced Simulation](./features/simulation.md)** - Configure complex simulation scenarios
3. **[API Integration](./api/README.md)** - Connect to real backend services
4. **[Collaboration](./features/collaboration.md)** - Share and collaborate on architectures

## Getting Help

- **Documentation**: Explore the [full documentation](./README.md)
- **Examples**: Check out example architectures in the sample projects
- **Community**: Join our Discord community for support and discussions
- **Issues**: Report bugs or request features on GitHub

---

Happy architecting! 🏗️