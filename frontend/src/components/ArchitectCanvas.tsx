import { useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useArchitectStore } from '@/stores/useArchitectStore';
import { getDefaultPropertiesForType } from '@/lib/design/serializer';
import { logger } from '@/lib/logger';
import { errorHandler } from '@/lib/errorHandler';
import { GenericServiceNode } from './nodes/GenericServiceNode';
import { DatabaseNode } from './nodes/DatabaseNode';
import { MessageQueueNode } from './nodes/MessageQueueNode';
import { LoadBalancerNode } from './nodes/LoadBalancerNode';
import { CacheNode } from './nodes/CacheNode';
import { APIGatewayNode } from './nodes/APIGatewayNode';
import { EnhancedArchitectEdge } from './edges/EnhancedArchitectEdge';

/**
 * Enhanced architect canvas with real-time simulation and visual feedback
 * Provides drag-and-drop functionality for building system architectures
 * 
 * @component
 * @example
 * ```tsx
 * <ArchitectCanvas />
 * ```
 */

export const ArchitectCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Memoize node types for performance
  const nodeTypes = useMemo(() => ({
    'generic-service': GenericServiceNode,
    'database': DatabaseNode,
    'message-queue': MessageQueueNode,
    'load-balancer': LoadBalancerNode,
    'cache': CacheNode,
    'api-gateway': APIGatewayNode,
  }), []);

  // Memoize edge types for performance
  const edgeTypes = useMemo(() => ({
    'architech': EnhancedArchitectEdge,
  }), []);
  
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onConnect,
    selectNode,
    selectEdge,
  } = useArchitectStore();

  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState(nodes);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState(edges);

  // Sync store with React Flow with logging
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    try {
      onNodesChange(changes);
      setNodes(reactFlowNodes);
      
      // Log node changes for debugging
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          logger.userAction('node_moved', 'ArchitectCanvas', {
            nodeId: change.id,
            position: change.position
          });
        }
      });
    } catch (error) {
      errorHandler.handleError(error as Error, 'ArchitectCanvas');
    }
  }, [onNodesChange, setNodes, reactFlowNodes]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
    setEdges(reactFlowEdges);
  }, [onEdgesChange, setEdges, reactFlowEdges]);

  const handleConnect = useCallback((params: Connection) => {
    setReactFlowEdges((eds) => addEdge({ ...params, type: 'architech' }, eds));
    onConnect(params);
  }, [onConnect, setReactFlowEdges]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id);
    logger.userAction('node_selected', 'ArchitectCanvas', { nodeId: node.id, nodeType: node.type });
  }, [selectNode]);

  const handleEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    selectEdge(edge.id);
  }, [selectEdge]);

  const handlePaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      try {
        const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');

        if (typeof type === 'undefined' || !type || !reactFlowBounds) {
          logger.warn('Invalid drop operation', {
            componentName: 'ArchitectCanvas',
            payload: { type, hasBounds: !!reactFlowBounds }
          });
          return;
        }

        const position = reactFlowInstance.current?.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        if (!position) return;

        const newNode: Node = {
          id: `${type}-${Date.now()}`,
          type,
          position,
          data: {
            label: `New ${type.replace('-', ' ')}`,
            properties: getDefaultPropertiesForType(type),
          },
        };

        setReactFlowNodes((nds) => nds.concat(newNode));
        setNodes([...reactFlowNodes, newNode]);

        logger.userAction('component_dropped', 'ArchitectCanvas', {
          nodeType: type,
          position,
          nodeId: newNode.id
        });
      } catch (error) {
        errorHandler.handleError(error as Error, 'ArchitectCanvas');
      }
    },
    [reactFlowNodes, setNodes, setReactFlowNodes]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  return (
    <div className="flex-1 h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        style={{ backgroundColor: 'hsl(var(--canvas-background))' }}
        className="architech-flow"
      >
        <Controls 
          className="!bg-card !border-border !shadow-panel"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        <MiniMap 
          className="!bg-card !border-border !shadow-panel"
          nodeColor="hsl(var(--primary))"
          maskColor="hsl(var(--muted) / 0.2)"
        />
        <Background 
          gap={20}
          size={1}
          color="hsl(var(--canvas-grid))"
        />
      </ReactFlow>
    </div>
  );
};
