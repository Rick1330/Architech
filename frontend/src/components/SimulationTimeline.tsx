import { useState } from 'react';
import { useArchitectStore } from '@/stores/useArchitectStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SimulationEventMarkers } from '@/components/SimulationEventMarkers';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack, 
  Gauge,
  Clock,
  Activity
} from 'lucide-react';

export const SimulationTimeline = () => {
  const {
    simulation,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    setSimulationSpeed,
  } = useArchitectStore();

  const [playbackPosition, setPlaybackPosition] = useState([0]);

  const handlePlayPause = () => {
    if (simulation.isRunning) {
      pauseSimulation();
    } else {
      startSimulation();
    }
  };

  const handleStop = () => {
    stopSimulation();
    setPlaybackPosition([0]);
  };

  const handleSpeedChange = (value: number[]) => {
    setSimulationSpeed(value[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-20 bg-card border-t border-border flex items-center px-4 gap-4">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPlaybackPosition([Math.max(0, playbackPosition[0] - 10)])}
          disabled={playbackPosition[0] === 0}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button
          variant={simulation.isRunning ? "secondary" : "default"}
          size="sm"
          onClick={handlePlayPause}
          className="w-12 h-12"
        >
          {simulation.isRunning ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleStop}
          disabled={!simulation.isRunning && simulation.currentTime === 0}
        >
          <Square className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPlaybackPosition([Math.min(100, playbackPosition[0] + 10)])}
          disabled={playbackPosition[0] === 100}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Timeline Scrubber */}
      <div className="flex-1 flex items-center gap-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground flex-shrink-0">
            {formatTime(simulation.currentTime)}
          </span>
          
          <div className="flex-1 px-4 relative">
            <SimulationEventMarkers />
            <Slider
              value={playbackPosition}
              onValueChange={setPlaybackPosition}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          
          <span className="text-sm text-muted-foreground flex-shrink-0">
            05:00
          </span>
        </div>
      </div>

      {/* Simulation Info */}
      <div className="flex items-center gap-4">
        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground min-w-0">Speed:</span>
          <div className="w-20">
            <Slider
              value={[simulation.speed]}
              onValueChange={handleSpeedChange}
              min={0.1}
              max={5}
              step={0.1}
              className="w-full"
            />
          </div>
          <Badge variant="outline" className="text-xs min-w-0">
            {simulation.speed.toFixed(1)}x
          </Badge>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <div className="w-24">
            <Progress value={simulation.progress} className="h-2" />
          </div>
          <span className="text-sm text-muted-foreground min-w-0">
            {simulation.progress.toFixed(0)}%
          </span>
        </div>

        {/* Status */}
        <Badge 
          variant={simulation.isRunning ? "default" : "secondary"}
          className="flex items-center gap-1"
        >
          <div className={`w-2 h-2 rounded-full ${
            simulation.isRunning ? 'bg-status-active animate-pulse' : 'bg-status-idle'
          }`} />
          {simulation.isRunning ? 'Running' : 'Stopped'}
        </Badge>
      </div>
    </div>
  );
};