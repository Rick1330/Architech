import { useEffect } from 'react';
import { useArchitectStore } from '@/stores/useArchitectStore';

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
        // Ensure all nodes get status updates, with more frequent active states
        const rand = Math.random();
        let randomStatus: 'idle' | 'active' | 'warning' | 'error';
        
        if (rand < 0.6) randomStatus = 'active';      // 60% active
        else if (rand < 0.85) randomStatus = 'idle';  // 25% idle  
        else if (rand < 0.95) randomStatus = 'warning'; // 10% warning
        else randomStatus = 'error';                   // 5% error
        
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
              level: randomStatus === 'error' ? 'error' : randomStatus === 'warning' ? 'warn' : 'info',
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
            message: `Component ${Array.isArray(node.data?.properties) && 
                     node.data.properties.find((p: { id: string; value: string | number | boolean }) => p.id === 'name')?.value || node.id} status: ${randomStatus}`,
          });
        }
      });

      // Update edge statuses based on connected nodes
      setEdges((currentEdges) => 
        currentEdges.map((edge) => {
          const rand = Math.random();
          let edgeStatus: 'idle' | 'active' | 'error' | 'success';
          
          if (rand < 0.7) edgeStatus = 'active';      // 70% active
          else if (rand < 0.9) edgeStatus = 'idle';   // 20% idle
          else if (rand < 0.98) edgeStatus = 'success'; // 8% success
          else edgeStatus = 'error';                   // 2% error
          
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
        })
      );
    }, 1000 / simulation.speed); // Adjust interval based on speed

    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.speed, simulation.currentTime, nodes, edges, setEdges, addSimulationEvent, setSimulationTime, updateNodeStatus, simulation.duration]);

  return null;
};