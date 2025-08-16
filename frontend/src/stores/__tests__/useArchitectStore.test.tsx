import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useArchitectStore } from '../useArchitectStore';

describe('useArchitectStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useArchitectStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      nodeStatuses: {},
      simulation: {
        isRunning: false,
        currentTime: 0,
        speed: 1,
        progress: 0,
        duration: 300,
        events: [],
        snapshots: [],
      },
    });
  });

  describe('node management', () => {
    it('adds nodes correctly using setNodes', () => {
      const { result } = renderHook(() => useArchitectStore());
      
      const node = {
        id: 'node-1',
        type: 'service',
        position: { x: 100, y: 100 },
        data: { label: 'Test Service' },
      };

      act(() => {
        result.current.setNodes([node]);
      });

      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.nodes[0]).toEqual(node);
    });

    it('updates node properties', () => {
      const { result } = renderHook(() => useArchitectStore());
      
      const node = {
        id: 'node-1',
        type: 'service',
        position: { x: 100, y: 100 },
        data: { label: 'Test Service', properties: [] },
      };

      act(() => {
        result.current.setNodes([node]);
        result.current.updateNodeProperty('node-1', 'test-prop', 'test-value');
      });

      const updatedNode = result.current.nodes.find(n => n.id === 'node-1');
      expect(updatedNode).toBeDefined();
    });

    it('selects nodes correctly', () => {
      const { result } = renderHook(() => useArchitectStore());

      act(() => {
        result.current.selectNode('node-1');
      });

      expect(result.current.selectedNodeId).toBe('node-1');

      act(() => {
        result.current.selectNode(null);
      });

      expect(result.current.selectedNodeId).toBeNull();
    });
  });

  describe('edge management', () => {
    it('adds edges correctly using setEdges', () => {
      const { result } = renderHook(() => useArchitectStore());
      
      const edge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'http',
      };

      act(() => {
        result.current.setEdges([edge]);
      });

      expect(result.current.edges).toHaveLength(1);
      expect(result.current.edges[0]).toEqual(edge);
    });

    it('handles edge connections', () => {
      const { result } = renderHook(() => useArchitectStore());
      
      const connection = {
        source: 'node-1',
        target: 'node-2',
        sourceHandle: null,
        targetHandle: null,
      };

      act(() => {
        result.current.onConnect(connection);
      });

      expect(result.current.edges).toHaveLength(1);
      expect(result.current.edges[0].source).toBe('node-1');
      expect(result.current.edges[0].target).toBe('node-2');
    });
  });

  describe('simulation state', () => {
    it('starts simulation correctly', () => {
      const { result } = renderHook(() => useArchitectStore());

      act(() => {
        result.current.startSimulation();
      });

      expect(result.current.simulation.isRunning).toBe(true);
    });

    it('stops simulation correctly', () => {
      const { result } = renderHook(() => useArchitectStore());

      act(() => {
        result.current.startSimulation();
        result.current.stopSimulation();
      });

      expect(result.current.simulation.isRunning).toBe(false);
      expect(result.current.simulation.currentTime).toBe(0);
      expect(result.current.simulation.progress).toBe(0);
    });

    it('updates node status during simulation', () => {
      const { result } = renderHook(() => useArchitectStore());

      const status = {
        status: 'active' as const,
        metrics: {
          cpu: 75.5,
          memory: 512,
          latency: 45,
          requests: 1000,
        },
      };

      act(() => {
        result.current.updateNodeStatus('node-1', status);
      });

      expect(result.current.nodeStatuses['node-1']).toEqual(status);
    });
  });
});