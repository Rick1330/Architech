import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface ComponentCardProps {
  component: {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    color: string;
  };
  onDragStart: (e: React.DragEvent, component: {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    color: string;
  }) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const ComponentCard = ({ component, onDragStart, isFavorite, onToggleFavorite }: ComponentCardProps) => {
  const getComponentIcon = (iconName: string, color: string) => {
    // Return basic icon for now
    return <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />;
  };

  return (
    <button
      draggable
      onDragStart={(e) => onDragStart(e, component)}
      className="p-3 border border-border rounded-lg cursor-move hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 group w-full text-left bg-background"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Handle keyboard interaction for drag start
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-md flex-shrink-0"
          style={{ backgroundColor: `${component.color}20` }}
        >
          {getComponentIcon(component.icon, component.color)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm">{component.name}</h3>
            <button
              type="button"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 cursor-pointer flex items-center justify-center hover:bg-muted rounded-sm transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(component.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(component.id);
                }
              }}
            >
              <Star className={`h-3 w-3 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {component.description}
          </p>
          <Badge variant="outline" className="text-xs">
            {component.category}
          </Badge>
        </div>
      </div>
    </button>
  );
};