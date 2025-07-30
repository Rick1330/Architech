
'use client';
import { useRef } from 'react';
import { useAppContext } from '@/contexts/app-context';
import CanvasComponent from './canvas-component';
import { cn } from '@/lib/utils';
import type { Connection } from '@/lib/types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Copy, LassoSelect, ZoomIn } from 'lucide-react';


function ConnectionLine({ connection }: { connection: Connection }) {
  const { state, dispatch } = useAppContext();
  const fromComponent = state.components.find(c => c.id === connection.from);
  const toComponent = state.components.find(c => c.id === connection.to);

  if (!fromComponent || !toComponent) return null;

  const from = { x: fromComponent.position.x + 72, y: fromComponent.position.y + 48 };
  const to = { x: toComponent.position.x + 72, y: toComponent.position.y + 48 };

  const R = 56; // Radius for endpoint calculation
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  
  const startPoint = {
    x: from.x + R * Math.cos(angle),
    y: from.y + R * Math.sin(angle),
  };
  
  const endPoint = {
    x: to.x - R * Math.cos(angle),
    y: to.y - R * Math.sin(angle),
  };
  
  const pathData = `M ${startPoint.x},${startPoint.y} C ${startPoint.x + 50},${startPoint.y} ${endPoint.x - 50},${endPoint.y} ${endPoint.x},${endPoint.y}`;

  const isError = state.simulationState === 'RUNNING' && connection.status === 'error';
  const animationDuration = state.simulationState === 'RUNNING' ? `${2 / (connection.throughput || 1)}s` : '0s';
  const isSelected = state.selectedConnectionId === connection.id;

  const handleSelectConnection = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'SELECT_CONNECTION', payload: { id: connection.id } });
  };


  return (
    <g>
      <path 
        d={pathData}
        className="stroke-transparent"
        strokeWidth="20" 
        fill="none"
        onClick={handleSelectConnection}
        style={{ cursor: 'pointer' }}
      />
      <path 
        d={pathData}
        className={cn(
          "transition-colors duration-300",
          isError ? "stroke-destructive/80" : "stroke-muted-foreground/80",
          isSelected && "stroke-primary/80"
        )}
        strokeWidth={isSelected ? "4" : "3"} 
        strokeDasharray="2 12"
        strokeLinecap="round"
        fill="none"
        style={{ pointerEvents: 'none' }}
      >
        {state.simulationState === 'RUNNING' && (
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-14"
            dur={animationDuration}
            repeatCount="indefinite"
          />
        )}
      </path>
    </g>
  );
}

interface DesignCanvasProps {
  onAddComponent: (componentId: string, position: { x: number; y: number }) => void;
  onDeleteComponent: (id: string) => void;
  onAddConnection: (from: string, to: string) => void;
}

export default function DesignCanvas({ onAddComponent, onDeleteComponent, onAddConnection }: DesignCanvasProps) {
  const { state, dispatch } = useAppContext();
  const canvasRef = useRef<HTMLDivElement>(null);
  const panStart = useRef({ x: 0, y: 0 });

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const componentId = e.dataTransfer.getData('text/plain');
    if (!componentId || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: (e.clientX - canvasRect.left - state.pan.x) / state.zoom - 72, // Center drop based on component width
      y: (e.clientY - canvasRect.top - state.pan.y) / state.zoom - 72, // Center drop based on component height
    };

    onAddComponent(componentId, position);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if(e.target !== canvasRef.current && !Array.from(canvasRef.current?.children || []).includes(e.target as Element)) return;

    // Deselect component if clicking on canvas background
    if (e.target === canvasRef.current) {
        dispatch({ type: 'SELECT_COMPONENT', payload: { id: null } });
        dispatch({ type: 'SELECT_CONNECTION', payload: { id: null } });
    }

    if (e.button !== 0) return; // Only pan with left-click
    dispatch({ type: 'SET_PANNING', payload: true });
    panStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!state.isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    dispatch({ type: 'PAN_CANVAS', payload: { dx, dy } });
    panStart.current = { x: e.clientX, y: e.clientY };
  };
  
  const handleMouseUp = () => {
    dispatch({ type: 'SET_PANNING', payload: false });
  };

  const handleMouseLeave = () => {
    dispatch({ type: 'SET_PANNING', payload: false });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
     if(e.target !== e.currentTarget) return;
    if(state.connecting.from) {
      dispatch({ type: 'CANCEL_CONNECTION' });
    } else {
      dispatch({ type: 'SELECT_COMPONENT', payload: { id: null } });
      dispatch({ type: 'SELECT_CONNECTION', payload: { id: null } });
    }
  }
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? -0.1 : 0.1;
    dispatch({ 
        type: 'SET_ZOOM', 
        payload: { 
            zoom: state.zoom + zoomFactor,
        }
    });
  }

  const handleFitToView = () => {
    dispatch({ type: 'FIT_TO_VIEW' });
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={canvasRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "relative flex-1 bg-secondary/40 overflow-hidden",
            state.isPanning ? 'cursor-grabbing' : 'cursor-grab'
          )}
          style={{
            backgroundPosition: `${state.pan.x}px ${state.pan.y}px`,
            backgroundImage: 'radial-gradient(hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: `${20 * state.zoom}px ${20 * state.zoom}px`,
          }}
        >
          <div 
            className="absolute top-0 left-0 w-full h-full" 
            style={{ transform: `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`, transformOrigin: 'top left' }}
          >
            <svg className="absolute top-0 left-0 w-full h-full" style={{ width: '9999px', height: '9999px', pointerEvents: 'none' }}>
              <g style={{ pointerEvents: 'all' }}>
                {state.connections.map(conn => (
                  <ConnectionLine key={conn.id} connection={conn} />
                ))}
              </g>
            </svg>
            {state.components.map((component) => (
              <CanvasComponent key={component.id} component={component} onDelete={onDeleteComponent} />
            ))}
          </div>
          
          {state.connecting.from && <div className="absolute top-2 left-2 px-3 py-1 text-sm rounded-full bg-accent text-accent-foreground animate-pulse">Select a component to connect to...</div>}

        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <Copy className="mr-2" /> Paste Component
        </ContextMenuItem>
        <ContextMenuItem>
            <LassoSelect className="mr-2" /> Select All
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleFitToView}>
            <ZoomIn className="mr-2" /> Fit to View
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
