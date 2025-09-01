import { useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useArchitectStore, NodeStatus, SimulationEvent } from '@/stores/useArchitectStore';

// Helper function to get random status
const getRandomStatus = (): 'idle' | 'active' | 'warning' | 'error' => {
  const rand = Math.random();
  if (rand < 0.6) return 'active';      // 60% active
  if (rand < 0.85) return 'idle';       // 25% idle  
  if (rand < 0.95) return 'warning';    // 10% warning
  return 'error';                       // 5% error
};

// Helper function to get log level based on status
const getLogLevel = (status: string): 'error' | 'warn' | 'info' => {
  if (status === 'error') return 'error';
  if (status === 'warning') return 'warn';
  return 'info';
};

// Helper function to get node display name
const getNodeDisplayName = (node: { id: string; data?: { properties?: Array<{ id: string; value: string | number | boolean }> } }): string => {
  const nameProperty = Array.isArray(node.data?.properties) && 
                      node.data.properties.find((p: { id: string; value: string | number | boolean }) => p.id === 'name');
  return nameProperty?.value?.toString() || node.id;
};

// Helper function to get edge status
const getEdgeStatus = (): 'idle' | 'active' | 'error' | 'success' => {
  const rand = Math.random();
  if (rand < 0.7) return 'active';      // 70% active
  if (rand < 0.9) return 'idle';        // 20% idle
  if (rand < 0.98) return 'success';    // 8% success
  return 'error';                       // 2% error
};

// Helper function to process a single node
const processNode = (
  node: Node,
  newTime: number,
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void,
  addSimulationEvent: (event: Omit<SimulationEvent, 'id'>) => void
) => {
  const randomStatus = getRandomStatus();
  
  updateNodeStatus(node.id, {
    status: randomStatus,
    metrics: {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      requests: Math.random() * 1000,
      latency: Math.random() * 500,
    },
    logs: [
      {  
        timestamp: Date.now(),
        level: getLogLevel(randomStatus),
        message: `${randomStatus.charAt(0).toUpperCase() + randomStatus.slice(1)} status detected`,
      }
    ],
  });

  // Add simulation event for errors/warnings
  if (randomStatus === 'error' || randomStatus === 'warning') {
    addSimulationEvent({
      time: newTime,
      type: randomStatus === 'error' ? 'error' : 'warning',
      componentId: node.id,
      message: `Component ${getNodeDisplayName(node)} status: ${randomStatus}`,
    });
  }
};

// Helper function to update edge data
const updateEdgeData = (edge: Edge) => {
  const edgeStatus = getEdgeStatus();
  
  return {
    ...edge,
    data: {
      ...edge.data,
      status: edgeStatus,
      throughput: edgeStatus === 'active' ? Math.floor(Math.random() * 1000) : 0,
      latency: Math.floor(Math.random() * 100),
      errorRate: edgeStatus === 'error' ? Math.floor(Math.random() * 10) : 0,
      protocol: edge.data?.protocol || 'HTTP',
    },
  };
};

// Mock simulation engine for demonstration
export const useSimulationEngine = () => {
  const {
    simulation,
    nodes,
    edges,
    updateNodeStatus,
    addSimulationEvent,
    setSimulationTime,
    setEdges,
  } = useArchitectStore();

  useEffect(() => {
    if (!simulation.isRunning) return;

    const interval = setInterval(() => {
      const newTime = simulation.currentTime + simulation.speed;
      
      if (newTime >= simulation.duration) {
        // Simulation complete
        return;
      }

      setSimulationTime(newTime);

      // Simulate random events and status changes for all nodes
      nodes.forEach((node) => {
        processNode(node, newTime, updateNodeStatus, addSimulationEvent);
      });

      // Update edge statuses based on connected nodes
      setEdges((currentEdges) => currentEdges.map(updateEdgeData));
    }, 1000 / simulation.speed); // Adjust interval based on speed

    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.speed, simulation.currentTime, nodes, edges, setEdges, addSimulationEvent, setSimulationTime, updateNodeStatus, simulation.duration]);

  return null;
};