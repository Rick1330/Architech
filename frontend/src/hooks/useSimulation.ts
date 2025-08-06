/**
 * Simulation Hook
 * Manages simulation sessions and real-time communication
 */

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { simulationWebSocket, SimulationMessage } from '@/lib/websocket/client';
import { logger } from '@/lib/logger';
import { errorHandler } from '@/lib/errorHandler';
import { useToast } from '@/hooks/use-toast';
import { useArchitectStore } from '@/stores/useArchitectStore';

interface SimulationSession {
  session_id: string;
  design_id: string;
  status: 'created' | 'running' | 'stopped' | 'error';
  created_at: string;
  config?: Record<string, unknown>;
}

export const useSimulation = () => {
  const [currentSession, setCurrentSession] = useState<SimulationSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { 
    addSimulationEvent,
    updateNodeStatus,
    startSimulation: startStoreSimulation,
    stopSimulation: stopStoreSimulation,
    setSimulationSpeed,
    nodes,
    edges 
  } = useArchitectStore();

  /**
   * Handle incoming WebSocket messages
   */
  const handleSimulationMessage = useCallback((message: SimulationMessage) => {
    logger.debug('Simulation message received', {
      componentName: 'useSimulation',
      action: 'simulation_message_received',
      payload: { messageType: message.type, sessionId: message.session_id }
    });

    switch (message.type) {
      case 'simulation_started':
        startStoreSimulation();
        toast({
          title: 'Simulation Started',
          description: 'Real-time simulation is now running.',
        });
        break;

      case 'simulation_stopped':
        stopStoreSimulation();
        toast({
          title: 'Simulation Stopped',
          description: 'Simulation has been stopped.',
        });
        break;

      case 'simulation_event':
        addSimulationEvent({
          time: Date.now(),
          type: message.data.event_type || 'info',
          message: message.data.message || 'Simulation event',
          componentId: message.data.component_id,
          data: message.data
        });
        break;

      case 'simulation_metric':
        if (message.data.component_id && message.data.component_type === 'node') {
          updateNodeStatus(message.data.component_id, {
            status: message.data.status || 'active',
            metrics: {
              cpu: message.data.cpu || 0,
              memory: message.data.memory || 0,
              latency: message.data.latency || 0,
              ...message.data.metrics
            }
          });
        } else if (message.data.component_id && message.data.component_type === 'edge') {
          // Edge status updates would need to be implemented in the store
          // For now, just log the event
          logger.debug('Edge status update received', {
            componentName: 'useSimulation',
            payload: { edgeId: message.data.component_id, status: message.data.status }
          });
        }
        break;

      case 'error':
        toast({
          variant: 'destructive',
          title: 'Simulation Error',
          description: message.data.message || 'An error occurred during simulation.',
        });
        break;

      default:
        logger.warn('Unknown simulation message type', {
          componentName: 'useSimulation',
          payload: { messageType: message.type }
        });
    }
  }, [startStoreSimulation, stopStoreSimulation, addSimulationEvent, updateNodeStatus, toast]);

  /**
   * Create simulation session
   */
  const createSession = useCallback(async (designId: string, config?: Record<string, unknown>) => {
    try {
      logger.userAction('create_simulation_session', 'useSimulation', { designId });
      
      const response = await apiClient.createSimulationSession(designId, undefined, config);
      const session: SimulationSession = {
        session_id: response.session_id,
        design_id: designId,
        status: 'created',
        created_at: new Date().toISOString(),
        config
      };
      
      setCurrentSession(session);
      setConnectionError(null);
      
      toast({
        title: 'Session Created',
        description: `Simulation session ${response.session_id} created successfully.`,
      });
      
      return session;
    } catch (error) {
      const appError = errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to create simulation session'),
        'useSimulation'
      );
      
      toast({
        variant: 'destructive',
        title: 'Session Creation Failed',
        description: appError.userFriendlyMessage || 'Failed to create simulation session.',
      });
      
      throw appError;
    }
  }, [toast]);

  /**
   * Connect to simulation WebSocket
   */
  const connectToSession = useCallback(async (sessionId: string) => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      logger.userAction('connect_simulation_websocket', 'useSimulation', { sessionId });
      
      await simulationWebSocket.connect(sessionId);
      
      setIsConnecting(false);
      
      toast({
        title: 'Connected',
        description: 'Connected to real-time simulation updates.',
      });
    } catch (error) {
      setIsConnecting(false);
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setConnectionError(errorMessage);
      
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: 'Failed to connect to simulation updates.',
      });
      
      throw error;
    }
  }, [toast]);

  /**
   * Start simulation
   */
  const startSimulation = useCallback(async () => {
    if (!currentSession) {
      throw new Error('No active simulation session');
    }

    try {
      logger.userAction('start_simulation', 'useSimulation', { 
        sessionId: currentSession.session_id 
      });
      
      await apiClient.startSimulation(currentSession.session_id);
      
      setCurrentSession(prev => prev ? { ...prev, status: 'running' } : null);
    } catch (error) {
      const appError = errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to start simulation'),
        'useSimulation'
      );
      
      toast({
        variant: 'destructive',
        title: 'Start Failed',
        description: appError.userFriendlyMessage || 'Failed to start simulation.',
      });
      
      throw appError;
    }
  }, [currentSession, toast]);

  /**
   * Stop simulation
   */
  const stopSimulation = useCallback(async () => {
    if (!currentSession) {
      throw new Error('No active simulation session');
    }

    try {
      logger.userAction('stop_simulation', 'useSimulation', { 
        sessionId: currentSession.session_id 
      });
      
      await apiClient.stopSimulation(currentSession.session_id);
      
      setCurrentSession(prev => prev ? { ...prev, status: 'stopped' } : null);
    } catch (error) {
      const appError = errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to stop simulation'),
        'useSimulation'
      );
      
      toast({
        variant: 'destructive',
        title: 'Stop Failed',
        description: appError.userFriendlyMessage || 'Failed to stop simulation.',
      });
      
      throw appError;
    }
  }, [currentSession, toast]);

  /**
   * Disconnect from simulation
   */
  const disconnect = useCallback(() => {
    simulationWebSocket.disconnect();
    setCurrentSession(null);
    setConnectionError(null);
    
    logger.userAction('disconnect_simulation', 'useSimulation');
  }, []);

  // Setup WebSocket event handlers
  useEffect(() => {
    const unsubscribeMessage = simulationWebSocket.onMessage(handleSimulationMessage);
    
    const unsubscribeError = simulationWebSocket.onError(() => {
      setConnectionError('WebSocket connection error');
    });
    
    const unsubscribeDisconnect = simulationWebSocket.onDisconnect(() => {
      setConnectionError('Connection lost');
    });

    return () => {
      unsubscribeMessage();
      unsubscribeError();
      unsubscribeDisconnect();
    };
  }, [handleSimulationMessage]);

  return {
    currentSession,
    isConnected: simulationWebSocket.isConnected,
    isConnecting,
    connectionError,
    createSession,
    connectToSession,
    startSimulation,
    stopSimulation,
    disconnect,
  };
};