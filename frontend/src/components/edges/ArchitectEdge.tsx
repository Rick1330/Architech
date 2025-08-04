import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  Edge,
  Position,
} from '@xyflow/react';

interface EdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
  markerEnd?: string;
  selected?: boolean;
  animated?: boolean;
}

export const ArchitectEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  animated,
}: EdgeProps) => {
  const { setEdges } = useReactFlow();
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEdges((edges: Edge[]) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? 'hsl(var(--canvas-selection))' : 'hsl(var(--flow-data))',
          strokeWidth: selected ? 3 : 2,
          ...style,
        }}
        className={animated ? 'animate-pulse' : ''}
      />
      
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-all"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <button
            className={`
              w-6 h-6 bg-card border border-border rounded-full 
              flex items-center justify-center text-xs
              hover:bg-destructive hover:text-destructive-foreground
              transition-colors duration-200
              ${selected ? 'border-canvas-selection' : ''}
            `}
            onClick={onEdgeClick}
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});