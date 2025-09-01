/**
 * Development Mock Server
 * Provides basic API endpoints for frontend development when Docker is not available
 */

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Mock data
let users = [
  {
    id: '1',
    email: 'demo@architech.dev',
    name: 'Demo User',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let projects = [
  {
    id: '1',
    name: 'Sample Project',
    description: 'A sample project for testing',
    user_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let designs = [
  {
    id: '1',
    name: 'Sample Design',
    description: 'A sample design for testing',
    project_id: '1',
    design_data: {
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let simulations = {};

// Mock JWT token
const MOCK_TOKEN = 'mock-jwt-token-for-development';

// Middleware to check auth (simplified for development)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  if (token !== MOCK_TOKEN) {
    return res.status(401).json({ detail: 'Invalid token' });
  }
  
  req.user = users[0]; // Mock user
  next();
};

// Auth endpoints
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'demo@architech.dev' && (password === 'demo' || password === 'demo123')) {
    res.json({
      access_token: MOCK_TOKEN,
      token_type: 'bearer',
      user: users[0]
    });
  } else {
    res.status(401).json({ detail: 'Invalid credentials' });
  }
});

app.post('/api/v1/auth/register', (req, res) => {
  const { email, name } = req.body;
  
  const newUser = {
    id: String(users.length + 1),
    email,
    name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  users.push(newUser);
  
  res.json({
    access_token: MOCK_TOKEN,
    token_type: 'bearer',
    user: newUser
  });
});

app.get('/api/v1/auth/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// Project endpoints
app.get('/api/v1/projects', authMiddleware, (req, res) => {
  res.json(projects.filter(p => p.user_id === req.user.id));
});

app.get('/api/v1/projects/:id', authMiddleware, (req, res) => {
  const project = projects.find(p => p.id === req.params.id && p.user_id === req.user.id);
  if (!project) {
    return res.status(404).json({ detail: 'Project not found' });
  }
  res.json(project);
});

app.post('/api/v1/projects', authMiddleware, (req, res) => {
  const { name, description } = req.body;
  
  const newProject = {
    id: String(projects.length + 1),
    name,
    description,
    user_id: req.user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  projects.push(newProject);
  res.json(newProject);
});

app.put('/api/v1/projects/:id', authMiddleware, (req, res) => {
  const project = projects.find(p => p.id === req.params.id && p.user_id === req.user.id);
  if (!project) {
    return res.status(404).json({ detail: 'Project not found' });
  }
  
  Object.assign(project, req.body, { updated_at: new Date().toISOString() });
  res.json(project);
});

app.delete('/api/v1/projects/:id', authMiddleware, (req, res) => {
  const index = projects.findIndex(p => p.id === req.params.id && p.user_id === req.user.id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Project not found' });
  }
  
  projects.splice(index, 1);
  res.status(204).send();
});

// Design endpoints
app.get('/api/v1/projects/:projectId/designs', authMiddleware, (req, res) => {
  const project = projects.find(p => p.id === req.params.projectId && p.user_id === req.user.id);
  if (!project) {
    return res.status(404).json({ detail: 'Project not found' });
  }
  
  res.json(designs.filter(d => d.project_id === req.params.projectId));
});

app.get('/api/v1/projects/:projectId/designs/:id', authMiddleware, (req, res) => {
  const design = designs.find(d => d.id === req.params.id && d.project_id === req.params.projectId);
  if (!design) {
    return res.status(404).json({ detail: 'Design not found' });
  }
  res.json(design);
});

app.post('/api/v1/projects/:projectId/designs', authMiddleware, (req, res) => {
  const project = projects.find(p => p.id === req.params.projectId && p.user_id === req.user.id);
  if (!project) {
    return res.status(404).json({ detail: 'Project not found' });
  }
  
  const { name, description, design_data } = req.body;
  
  const newDesign = {
    id: String(designs.length + 1),
    name,
    description,
    project_id: req.params.projectId,
    design_data: design_data || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  designs.push(newDesign);
  res.json(newDesign);
});

app.put('/api/v1/projects/:projectId/designs/:id', authMiddleware, (req, res) => {
  const design = designs.find(d => d.id === req.params.id && d.project_id === req.params.projectId);
  if (!design) {
    return res.status(404).json({ detail: 'Design not found' });
  }
  
  Object.assign(design, req.body, { updated_at: new Date().toISOString() });
  res.json(design);
});

app.delete('/api/v1/projects/:projectId/designs/:id', authMiddleware, (req, res) => {
  const index = designs.findIndex(d => d.id === req.params.id && d.project_id === req.params.projectId);
  if (index === -1) {
    return res.status(404).json({ detail: 'Design not found' });
  }
  
  designs.splice(index, 1);
  res.status(204).send();
});

// Simulation endpoints
app.post('/api/v1/simulations/start', authMiddleware, (req, res) => {
  const { design_id, config } = req.body;
  
  const simulationId = `sim_${Date.now()}`;
  simulations[simulationId] = {
    id: simulationId,
    design_id,
    status: 'running',
    config,
    started_at: new Date().toISOString(),
    metrics: {},
    logs: []
  };
  
  // Simulate some events
  setTimeout(() => {
    io.emit('simulation_event', {
      type: 'simulation_started',
      simulation_id: simulationId,
      data: { message: 'Simulation started successfully' }
    });
    
    // Simulate metrics updates
    let counter = 0;
    const metricsInterval = setInterval(() => {
      if (simulations[simulationId]?.status !== 'running') {
        clearInterval(metricsInterval);
        return;
      }
      
      io.emit('simulation_event', {
        type: 'metrics_update',
        simulation_id: simulationId,
        data: {
          timestamp: Date.now(),
          metrics: {
            requests_per_second: Math.floor(Math.random() * 100) + 50,
            average_latency: Math.floor(Math.random() * 50) + 10,
            error_rate: Math.random() * 0.05
          }
        }
      });
      
      counter++;
      if (counter > 10) {
        clearInterval(metricsInterval);
        simulations[simulationId].status = 'completed';
        io.emit('simulation_event', {
          type: 'simulation_stopped',
          simulation_id: simulationId,
          data: { message: 'Simulation completed' }
        });
      }
    }, 2000);
  }, 1000);
  
  res.json({ simulation_id: simulationId });
});

app.post('/api/v1/simulations/:id/stop', authMiddleware, (req, res) => {
  const simulation = simulations[req.params.id];
  if (!simulation) {
    return res.status(404).json({ detail: 'Simulation not found' });
  }
  
  simulation.status = 'stopped';
  simulation.stopped_at = new Date().toISOString();
  
  io.emit('simulation_event', {
    type: 'simulation_stopped',
    simulation_id: req.params.id,
    data: { message: 'Simulation stopped by user' }
  });
  
  res.status(204).send();
});

app.get('/api/v1/simulations/:id/status', authMiddleware, (req, res) => {
  const simulation = simulations[req.params.id];
  if (!simulation) {
    return res.status(404).json({ detail: 'Simulation not found' });
  }
  
  res.json(simulation);
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe', (data) => {
    const { simulation_id } = data;
    socket.join(`simulation_${simulation_id}`);
    console.log(`Client ${socket.id} subscribed to simulation ${simulation_id}`);
  });
  
  socket.on('unsubscribe', (data) => {
    const { simulation_id } = data;
    socket.leave(`simulation_${simulation_id}`);
    console.log(`Client ${socket.id} unsubscribed from simulation ${simulation_id}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Development server running on http://0.0.0.0:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/v1/auth/login');
  console.log('  POST /api/v1/auth/register');
  console.log('  GET  /api/v1/auth/me');
  console.log('  GET  /api/v1/projects');
  console.log('  POST /api/v1/projects');
  console.log('  GET  /api/v1/projects/:id/designs');
  console.log('  POST /api/v1/simulations/start');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Email: demo@architech.dev');
  console.log('  Password: demo');
});