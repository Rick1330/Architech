import { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Server, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useArchitectStore } from '@/stores/useArchitectStore';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { logger } from '@/lib/logger';

interface NodeProps {
  data: {
    label: string;
    properties: Array<{
      id: string;
      name: string;
      value: string | number | boolean;
    }>;
  };
  selected?: boolean;
}

export const GenericServiceNode = memo(({ data, selected, id }: NodeProps & { id: string }) => {
  const { nodeStatuses } = useArchitectStore();
  const status = nodeStatuses[id] || { status: 'idle' };
  const { getMetrics } = usePerformanceMonitor('GenericServiceNode');

  // Log component interactions
  const handleNodeInteraction = useCallback((action: string) => {
    logger.userAction(action, 'GenericServiceNode', { 
      nodeId: id,
      nodeName: data.label 
    });
  }, [id, data.label]);
  
  const nameProperty = data.properties?.find(p => p.id === 'name');
  const instancesProperty = data.properties?.find(p => p.id === 'instanceCount');
  const name = nameProperty?.value || data.label || 'Service';
  const instances = instancesProperty?.value || 1;

  const getStatusIcon = () => {
    switch (status.status) {
      case 'active':
        return <CheckCircle className="h-3 w-3 text-status-active" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-status-error" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-status-warning" />;
      default:
        return null;
    }
  };

  const getStatusBorder = () => {
    switch (status.status) {
      case 'active':
        return 'border-status-active shadow-glow-active';
      case 'error':
        return 'border-status-error shadow-glow-error animate-pulse';
      case 'warning':
        return 'border-status-warning';
      default:
        return 'border-border hover:border-node-service/50';
    }
  };

  return (
    <div 
      className={`
        relative bg-card border-2 rounded-lg shadow-node transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20
        ${selected ? 'border-canvas-selection shadow-glow-active' : getStatusBorder()}
        min-w-[140px] max-w-[200px]
      `}
      role="button"
      tabIndex={0}
      aria-label={`Service node: ${name}, Status: ${status.status}`}
      aria-describedby={`${id}-description`}
      onFocus={() => handleNodeInteraction('node_focused')}
      onBlur={() => handleNodeInteraction('node_blurred')}
    >
      {/* Status Indicator */}
      {status.status !== 'idle' && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="w-6 h-6 bg-card border-2 border-current rounded-full flex items-center justify-center">
            {getStatusIcon()}
          </div>
        </div>
      )}
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-node-service border-2 border-card"
      />
      
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-node-service/20">
            <Server className="h-4 w-4 text-node-service" />
          </div>
          <span className="font-medium text-sm truncate flex-1">{name}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            Service
          </Badge>
          <Badge variant="outline" className="text-xs">
            {instances}x
          </Badge>
        </div>
        
        {/* Metrics Display */}
        {status.metrics && (
          <div className="mt-2 pt-2 border-t border-border space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">CPU:</span>
              <span className={status.metrics.cpu > 80 ? 'text-status-error' : 'text-foreground'}>
                {status.metrics.cpu}%
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Memory:</span>
              <span className={status.metrics.memory > 80 ? 'text-status-error' : 'text-foreground'}>
                {status.metrics.memory}%
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">RPS:</span>
              <span>{status.metrics.requests}</span>
            </div>
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-node-service border-2 border-card"
      />
    </div>
  );
});