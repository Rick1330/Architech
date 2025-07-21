import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SimulationContainer = styled.div`
  display: flex;
  height: 100%;
`;

const ControlPanel = styled.div`
  width: 350px;
  background: #f8f9fa;
  border-right: 1px solid #e1e5e9;
  padding: 1rem;
  overflow-y: auto;
`;

const SimulationArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const SimulationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e1e5e9;
  background: white;
`;

const SimulationTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const SimulationActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: #667eea;
  color: white;
  
  &:hover:not(:disabled) {
    background: #5a6fd8;
  }
`;

const SecondaryButton = styled(Button)`
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover:not(:disabled) {
    background: #e9ecef;
  }
`;

const DangerButton = styled(Button)`
  background: #dc3545;
  color: white;
  
  &:hover:not(:disabled) {
    background: #c82333;
  }
`;

const SimulationCanvas = styled.div`
  flex: 1;
  background: #fafafa;
  position: relative;
  overflow: auto;
  padding: 1rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'running':
        return 'background: #d4edda; color: #155724;';
      case 'stopped':
        return 'background: #f8d7da; color: #721c24;';
      case 'paused':
        return 'background: #fff3cd; color: #856404;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #e1e5e9;
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
`;

const LogsContainer = styled.div`
  background: #1e1e1e;
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  height: 200px;
  overflow-y: auto;
  margin-top: 1rem;
`;

const LogEntry = styled.div`
  margin-bottom: 0.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PlaceholderContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  color: #666;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
`;

function Simulation() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const designId = searchParams.get('designId');
  
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('idle');
  const [metrics, setMetrics] = useState({
    throughput: 0,
    latency: 0,
    errorRate: 0,
    activeConnections: 0
  });
  const [logs, setLogs] = useState([]);
  const [config, setConfig] = useState({
    duration: 60,
    loadPattern: 'constant',
    targetRPS: 100,
    errorInjection: false
  });

  useEffect(() => {
    if (sessionId !== 'new') {
      fetchSimulation();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const fetchSimulation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/v1/simulations/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSimulation(response.data);
      setStatus(response.data.status);
    } catch (error) {
      console.error('Failed to fetch simulation:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartSimulation = async () => {
    try {
      const token = localStorage.getItem('token');
      
      let simulationData;
      if (sessionId === 'new') {
        // Create new simulation
        const response = await axios.post('/api/v1/simulations/', {
          design_id: designId,
          config: config
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        simulationData = response.data;
        setSimulation(simulationData);
        
        // Update URL to reflect the new simulation ID
        navigate(`/simulations/${simulationData.id}`, { replace: true });
      } else {
        simulationData = simulation;
      }

      // Start the simulation
      await axios.post(`/api/v1/simulations/${simulationData.id}/start`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setStatus('running');
      startMetricsPolling();
    } catch (error) {
      console.error('Failed to start simulation:', error);
    }
  };

  const handleStopSimulation = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/v1/simulations/${simulation.id}/stop`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStatus('stopped');
    } catch (error) {
      console.error('Failed to stop simulation:', error);
    }
  };

  const handlePauseSimulation = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/v1/simulations/${simulation.id}/pause`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStatus('paused');
    } catch (error) {
      console.error('Failed to pause simulation:', error);
    }
  };

  const startMetricsPolling = () => {
    const interval = setInterval(() => {
      // Simulate real-time metrics updates
      setMetrics({
        throughput: Math.floor(Math.random() * 1000) + 500,
        latency: Math.floor(Math.random() * 100) + 50,
        errorRate: Math.random() * 5,
        activeConnections: Math.floor(Math.random() * 200) + 100
      });
      
      // Add random log entries
      const logMessages = [
        'Request processed successfully',
        'Database connection established',
        'Cache hit for user data',
        'Load balancer routing request',
        'Authentication successful'
      ];
      
      const newLog = `[${new Date().toLocaleTimeString()}] ${logMessages[Math.floor(Math.random() * logMessages.length)]}`;
      setLogs(prev => [...prev.slice(-19), newLog]);
    }, 2000);

    // Store interval ID to clear it later
    window.simulationInterval = interval;
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  useEffect(() => {
    return () => {
      if (window.simulationInterval) {
        clearInterval(window.simulationInterval);
      }
    };
  }, []);

  if (loading) {
    return <LoadingState>Loading simulation...</LoadingState>;
  }

  return (
    <SimulationContainer>
      <ControlPanel>
        <Section>
          <SectionTitle>Simulation Status</SectionTitle>
          <StatusBadge status={status}>{status.toUpperCase()}</StatusBadge>
        </Section>

        <Section>
          <SectionTitle>Configuration</SectionTitle>
          <FormGroup>
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input
              type="number"
              id="duration"
              name="duration"
              value={config.duration}
              onChange={handleConfigChange}
              disabled={status === 'running'}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="loadPattern">Load Pattern</Label>
            <Select
              id="loadPattern"
              name="loadPattern"
              value={config.loadPattern}
              onChange={handleConfigChange}
              disabled={status === 'running'}
            >
              <option value="constant">Constant</option>
              <option value="ramp">Ramp Up</option>
              <option value="spike">Spike</option>
              <option value="step">Step</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="targetRPS">Target RPS</Label>
            <Input
              type="number"
              id="targetRPS"
              name="targetRPS"
              value={config.targetRPS}
              onChange={handleConfigChange}
              disabled={status === 'running'}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>
              <input
                type="checkbox"
                name="errorInjection"
                checked={config.errorInjection}
                onChange={handleConfigChange}
                disabled={status === 'running'}
                style={{ marginRight: '0.5rem' }}
              />
              Enable Error Injection
            </Label>
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>Real-time Metrics</SectionTitle>
          <MetricsGrid>
            <MetricCard>
              <MetricLabel>Throughput</MetricLabel>
              <MetricValue>{metrics.throughput} RPS</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Latency</MetricLabel>
              <MetricValue>{metrics.latency}ms</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Error Rate</MetricLabel>
              <MetricValue>{metrics.errorRate.toFixed(2)}%</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Connections</MetricLabel>
              <MetricValue>{metrics.activeConnections}</MetricValue>
            </MetricCard>
          </MetricsGrid>
        </Section>
      </ControlPanel>

      <SimulationArea>
        <SimulationHeader>
          <SimulationTitle>
            {simulation ? `Simulation: ${simulation.id}` : 'New Simulation'}
          </SimulationTitle>
          <SimulationActions>
            {status === 'idle' || status === 'stopped' ? (
              <PrimaryButton onClick={handleStartSimulation}>
                Start Simulation
              </PrimaryButton>
            ) : status === 'running' ? (
              <>
                <SecondaryButton onClick={handlePauseSimulation}>
                  Pause
                </SecondaryButton>
                <DangerButton onClick={handleStopSimulation}>
                  Stop
                </DangerButton>
              </>
            ) : status === 'paused' ? (
              <>
                <PrimaryButton onClick={handleStartSimulation}>
                  Resume
                </PrimaryButton>
                <DangerButton onClick={handleStopSimulation}>
                  Stop
                </DangerButton>
              </>
            ) : null}
          </SimulationActions>
        </SimulationHeader>
        
        <SimulationCanvas>
          {status === 'idle' ? (
            <PlaceholderContent>
              <div>
                <h3>Ready to Simulate</h3>
                <p>Configure your simulation parameters and click "Start Simulation" to begin.</p>
                <p><em>Advanced simulation visualization coming in Phase 5</em></p>
              </div>
            </PlaceholderContent>
          ) : (
            <div>
              <h3>Simulation Logs</h3>
              <LogsContainer>
                {logs.map((log, index) => (
                  <LogEntry key={index}>{log}</LogEntry>
                ))}
                {logs.length === 0 && (
                  <LogEntry>Waiting for simulation to start...</LogEntry>
                )}
              </LogsContainer>
            </div>
          )}
        </SimulationCanvas>
      </SimulationArea>
    </SimulationContainer>
  );
}

export default Simulation;

