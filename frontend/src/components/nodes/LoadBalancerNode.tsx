import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useArchitectStore } from '@/stores/useArchitectStore';

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
  id: string;
}

export const LoadBalancerNode = memo(({ data, selected, id }: NodeProps) => {
  const { nodeStatuses } = useArchitectStore();
  const status = nodeStatuses[id] || { status: 'idle' };
  
  const nameProperty = data.properties?.find(p => p.id === 'name');
  const algorithmProperty = data.properties?.find(p => p.id === 'algorithm');
  const name = nameProperty?.value || data.label || 'Load Balancer';
  const algorithm = algorithmProperty?.value || 'RoundRobin';

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
        return 'border-border hover:border-node-loadbalancer/50';
    }
  };

  return (
    <div className={`
      relative bg-card border-2 rounded-lg shadow-node transition-all duration-200
      ${selected ? 'border-canvas-selection shadow-glow-active' : getStatusBorder()}
      min-w-[140px] max-w-[200px]
    `}>
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
        className="w-3 h-3 !bg-node-loadbalancer border-2 border-card"
      />
      
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-node-loadbalancer/20">
            <GitBranch className="h-4 w-4 text-node-loadbalancer" />
          </div>
          <span className="font-medium text-sm truncate flex-1">{name}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            LB
          </Badge>
          <Badge variant="outline" className="text-xs">
            {algorithm}
          </Badge>
        </div>
        
        {/* Metrics Display */}
        {status.metrics && (
          <div className="mt-2 pt-2 border-t border-border space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Load:</span>
              <span>{Math.floor(status.metrics.cpu)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Requests:</span>
              <span>{Math.floor(status.metrics.requests)}/s</span>
            </div>
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-node-loadbalancer border-2 border-card"
      />
    </div>
  );
});