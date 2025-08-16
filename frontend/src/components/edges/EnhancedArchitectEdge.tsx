import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow, Position } from '@xyflow/react';
import { useArchitectStore } from '@/stores/useArchitectStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Zap,
  ArrowRight
} from 'lucide-react';

interface ArchitectEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
  markerEnd?: string;
  data?: {
    status?: 'idle' | 'active' | 'error' | 'success';
    throughput?: number;
    latency?: number;
    errorRate?: number;
    protocol?: string;
  };
}

export const EnhancedArchitectEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: ArchitectEdgeProps) => {
  const { setEdges } = useReactFlow();
  const { selectEdge, selectedEdgeId } = useArchitectStore();
  const isSelected = selectedEdgeId === id;
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    selectEdge(id);
  };

  const onDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const getEdgeStyle = () => {
    const baseStyle = {
      strokeWidth: 2,
      ...style,
    };

    if (data?.status) {
      switch (data.status) {
        case 'active':
          return {
            ...baseStyle,
            stroke: 'hsl(var(--status-active))',
            strokeWidth: 3,
            filter: 'drop-shadow(0 0 4px hsl(var(--status-active) / 0.5))',
          };
        case 'error':
          return {
            ...baseStyle,
            stroke: 'hsl(var(--status-error))',
            strokeWidth: 3,
            strokeDasharray: '5,5',
            filter: 'drop-shadow(0 0 4px hsl(var(--status-error) / 0.5))',
          };
        case 'success':
          return {
            ...baseStyle,
            stroke: 'hsl(var(--status-active))',
            strokeWidth: 2,
          };
        default:
          return {
            ...baseStyle,
            stroke: 'hsl(var(--border))',
          };
      }
    }

    if (isSelected) {
      return {
        ...baseStyle,
        stroke: 'hsl(var(--canvas-selection))',
        strokeWidth: 3,
      };
    }

    return baseStyle;
  };

  const getFlowAnimation = () => {
    if (data?.status === 'active' && data?.throughput && data.throughput > 0) {
      return {
        stroke: 'hsl(var(--flow-data))',
        strokeWidth: 1,
        strokeDasharray: '4,4',
        strokeDashoffset: -4,
        opacity: 0.8,
      };
    }
    return null;
  };

  const flowAnimationStyle = getFlowAnimation();

  return (
    <>
      {/* Main Edge */}
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={getEdgeStyle()}
        onClick={onEdgeClick}
      />
      
      {/* Flow Animation Overlay */}
      {flowAnimationStyle && (
        <BaseEdge 
          path={edgePath} 
          style={{
            ...flowAnimationStyle,
            animation: 'flow 2s linear infinite',
          }}
        />
      )}

      {/* Edge Label */}
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-all"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {(isSelected || data?.status === 'error' || data?.throughput) && (
            <div className="flex items-center gap-2">
              {/* Status Badge */}
              {data?.status && data.status !== 'idle' && (
                <Badge 
                  variant="outline" 
                  className={`text-xs bg-card/90 backdrop-blur-sm ${
                    data.status === 'active' ? 'border-status-active text-status-active' :
                    data.status === 'error' ? 'border-status-error text-status-error' :
                    'border-status-active text-status-active'
                  }`}
                >
                  {data.status === 'active' && <Activity className="h-3 w-3 mr-1" />}
                  {data.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {data.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {data.status}
                </Badge>
              )}

              {/* Throughput Indicator */}
              {data?.throughput && data.throughput > 0 && (
                <Badge variant="outline" className="text-xs bg-card/90 backdrop-blur-sm">
                  <Zap className="h-3 w-3 mr-1" />
                  {data.throughput}/s
                </Badge>
              )}

              {/* Protocol Badge */}
              {data?.protocol && isSelected && (
                <Badge variant="secondary" className="text-xs bg-card/90 backdrop-blur-sm">
                  {data.protocol}
                </Badge>
              )}

              {/* Delete Button */}
              {isSelected && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-6 w-6 p-0 bg-card/90 backdrop-blur-sm"
                  onClick={onDeleteClick}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>

      <style>{`
        @keyframes flow {
          to {
            stroke-dashoffset: -8;
          }
        }
      `}</style>
    </>
  );
});