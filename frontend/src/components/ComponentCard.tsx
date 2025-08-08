import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    const iconProps = { className: "h-4 w-4", style: { color } };
    // Return basic icon for now
    return <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />;
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, component)}
      className="p-3 border border-border rounded-lg cursor-move hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 group"
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
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(component.id);
              }}
            >
              <Star className={`h-3 w-3 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {component.description}
          </p>
          <Badge variant="outline" className="text-xs">
            {component.category}
          </Badge>
        </div>
      </div>
    </div>
  );
};