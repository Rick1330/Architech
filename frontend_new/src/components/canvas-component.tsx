
'use client';
import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { CanvasComponentData } from '@/lib/types';
import { useAppContext } from '@/contexts/app-context';
import { cn, getComponentColor } from '@/lib/utils';
import { Button } from './ui/button';
import { Plus, Trash2, AlertTriangle, TriangleAlert } from 'lucide-react';

interface CanvasComponentProps {
  component: CanvasComponentData;
  onDelete: (id: string) => void;
}

export default function CanvasComponent({ component, onDelete }: CanvasComponentProps) {
  const { state, dispatch } = useAppContext();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const componentRef = useRef<HTMLDivElement>(null);
  
  const { icon: Icon } = component;
  const isSelected = state.selectedComponentId === component.id;
  
  const bgColor = getComponentColor(component.category);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (state.isPanning) return;

    if (state.connecting.from) {
      dispatch({ type: 'SELECT_COMPONENT', payload: { id: component.id } });
      return;
    }

    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !componentRef.current) return;
    
    const dx = (e.clientX - dragStartPos.current.x) / state.zoom;
    const dy = (e.clientY - dragStartPos.current.y) / state.zoom;

    const newPosition = {
      x: component.position.x + dx,
      y: component.position.y + dy,
    };
    
    dispatch({ type: 'UPDATE_COMPONENT_POSITION', payload: { id: component.id, position: newPosition } });
    
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
    };
  }, [isDragging, state.zoom, component.id, component.position.x, component.position.y, dispatch]);
  
  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'START_CONNECTION', payload: { from: component.id }});
  }
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(component.id);
  };

  const handleSelect = () => {
    if (isDragging) return;

    if (state.connecting.from) {
      if(state.connecting.from !== component.id) {
         dispatch({ type: 'SELECT_COMPONENT', payload: { id: component.id } });
      }
    } else {
      dispatch({ type: 'SELECT_COMPONENT', payload: { id: component.id } });
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className="absolute group flex flex-col items-center"
      style={{
        left: component.position.x,
        top: component.position.y,
        touchAction: 'none',
        width: 144, 
      }}
      ref={componentRef}
      onMouseDown={handleMouseDown}
      onClick={handleSelect}
    >
        <div
            className={cn(
              'relative flex flex-col items-center justify-center p-0 rounded-full shadow-lg w-24 h-24 transition-transform duration-200 group-hover:scale-110',
              isDragging ? 'cursor-grabbing z-10' : 'cursor-grab',
              state.connecting.from && state.connecting.from !== component.id && 'hover:ring-4 hover:ring-accent/50',
              bgColor,
              'border-4 border-white/80 ring-4 ring-transparent',
              isSelected && 'ring-primary/30 scale-110 animate-pulse-glow',
              state.simulationState === 'RUNNING' && component.status === 'active' && 'ring-green-500/50 animate-pulse-active',
              state.simulationState === 'RUNNING' && component.status === 'warning' && 'ring-yellow-500/50 animate-pulse-warning',
              state.simulationState === 'RUNNING' && component.status === 'error' && 'ring-destructive/30 animate-pulse-error',
              state.connecting.from === component.id && 'animate-pulse-glow',
            )}
          >
            {Icon && <Icon className="w-16 h-16 text-white" />}
            {state.simulationState === 'RUNNING' && component.status === 'error' && (
              <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 border-2 border-background">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
            {state.simulationState === 'RUNNING' && component.status === 'warning' && (
              <div className="absolute -top-1 -right-1 bg-yellow-500 text-black rounded-full p-1 border-2 border-background">
                <TriangleAlert className="w-4 h-4" />
              </div>
            )}
        </div>

      <div className="text-center mt-2 w-full">
        <p className="text-sm font-semibold truncate text-foreground">{component.name}</p>
      </div>
      
       <button 
          className="absolute w-8 h-8 right-0 top-1/2 -translate-y-1/2 rounded-full bg-primary hover:bg-primary/90 border-4 border-background flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-50 transition-all duration-200"
          onClick={handleConnectClick}
          title="Create connection"
      >
          <Plus className="w-4 h-4 text-primary-foreground" />
      </button>
      
      <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button 
              variant="destructive" 
              size="icon" 
              className="w-7 h-7 rounded-full shadow-md"
              onClick={handleDeleteClick}
              title="Delete component"
          >
              <Trash2 className="w-4 h-4" />
          </Button>
      </div>
    </div>
  );
}
