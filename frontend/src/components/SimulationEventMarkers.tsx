import { useArchitectStore } from '@/stores/useArchitectStore';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface EventMarkerProps {
  event: {
    id: string;
    time: number;
    type: 'info' | 'warning' | 'error' | 'success';
    componentId?: string;
    message: string;
  };
  duration: number;
  onEventClick: (eventId: string) => void;
}

const EventMarker = ({ event, duration, onEventClick }: EventMarkerProps) => {
  const position = (event.time / duration) * 100;
  
  const getIcon = () => {
    switch (event.type) {
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3" />;
      case 'success':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const getColor = () => {
    switch (event.type) {
      case 'error':
        return 'text-status-error';
      case 'warning':
        return 'text-status-warning';
      case 'success':
        return 'text-status-active';
      default:
        return 'text-flow-data';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`absolute top-1 w-2 h-2 rounded-full cursor-pointer transition-all hover:scale-125 ${getColor()}`}
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
            onClick={() => onEventClick(event.id)}
          >
            <div className="w-full h-full bg-current rounded-full animate-pulse" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-64">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={getColor()}>
                {getIcon()}
              </div>
              <Badge variant="outline" className="text-xs">
                {formatTime(event.time)}
              </Badge>
            </div>
            <p className="text-sm">{event.message}</p>
            {event.componentId && (
              <p className="text-xs text-muted-foreground">
                Component: {event.componentId}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const SimulationEventMarkers = () => {
  const { simulation, setSimulationTime } = useArchitectStore();

  const handleEventClick = (eventId: string) => {
    const event = simulation.events.find(e => e.id === eventId);
    if (event) {
      setSimulationTime(event.time);
    }
  };

  if (simulation.events.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-x-0 top-0 h-4 pointer-events-none">
      <div className="relative w-full h-full pointer-events-auto">
        {simulation.events.map((event) => (
          <EventMarker
            key={event.id}
            event={event}
            duration={simulation.duration}
            onEventClick={handleEventClick}
          />
        ))}
      </div>
    </div>
  );
};