
'use client';
import { Play, Pause, Rewind, FastForward, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/app-context';
import { useEffect, useRef, useState } from 'react';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const SIMULATION_DURATION_S = 60; // Total simulation duration in seconds

export default function SimulationControls() {
  const { state, dispatch, api } = useAppContext();
  const { simulationState, simulationTime, simulationProgress, simulationSpeed, simulationId } = state;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStart = async () => {
    if (!state.currentDesignId) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { simulationId } = await api.startSimulation(state.currentDesignId);
      dispatch({ type: 'START_SIMULATION_SUCCESS', payload: { simulationId } });
    } catch(err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start simulation' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handlePause = async () => {
    if (!simulationId) return;
    await api.controlSimulation(simulationId, 'pause');
    dispatch({ type: 'SET_SIMULATION_STATE', payload: 'PAUSED' });
  };
  
  const handleResume = async () => {
    if (!simulationId) return;
    await api.controlSimulation(simulationId, 'resume');
    dispatch({ type: 'SET_SIMULATION_STATE', payload: 'RUNNING' });
  }

  const handleStop = async () => {
    if (!simulationId) return;
    await api.controlSimulation(simulationId, 'stop');
    dispatch({ type: 'SET_SIMULATION_STATE', payload: 'STOPPED' });
  };

  const handleSeek = (value: number[]) => {
    dispatch({ type: 'SEEK_SIMULATION', payload: value[0] });
  };

  const handleSpeedChange = (speed: string) => {
    dispatch({ type: 'SET_SIMULATION_SPEED', payload: parseFloat(speed) });
  };
  
  const handleStep = (direction: 'forward' | 'backward') => {
      dispatch({ type: 'STEP_SIMULATION', payload: { direction, totalDuration: SIMULATION_DURATION_S }})
  }
  
  const handleZoomIn = () => dispatch({ type: 'SET_ZOOM', payload: { zoom: state.zoom + 0.2 } });
  const handleZoomOut = () => dispatch({ type: 'SET_ZOOM', payload: { zoom: state.zoom - 0.2 } });
  const handleZoomReset = () => dispatch({ type: 'SET_ZOOM', payload: { zoom: 1 } });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handlePlayPause = () => {
    if (simulationState === 'RUNNING') {
      handlePause();
    } else if (simulationState === 'PAUSED') {
      handleResume();
    } else {
      handleStart();
    }
  }

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-card border rounded-lg shadow-lg">
      <div className="flex items-center gap-4 w-full">
        {/* Playback Controls */}
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => handleStep('backward')} disabled={simulationState !== 'PAUSED'}>
            <Rewind className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePlayPause}
            disabled={simulationState === 'STOPPED' || simulationProgress >= 100 || state.isLoading}
            className="w-10 h-10"
          >
            {simulationState === 'RUNNING' ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleStep('forward')} disabled={simulationState !== 'PAUSED'}>
            <FastForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono w-12 text-right">{formatTime(simulationTime)}</span>
          <Slider
            value={[simulationProgress]}
            onValueChange={handleSeek}
            disabled={simulationState === 'IDLE' || simulationState === 'RUNNING'}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground font-mono w-12">{formatTime(SIMULATION_DURATION_S)}</span>
        </div>

        {/* Speed & Zoom Controls */}
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={handleStop} disabled={simulationState === 'STOPPED'}>Stop</Button>
          <Select value={simulationSpeed.toString()} onValueChange={handleSpeedChange}>
            <SelectTrigger className="w-[80px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.5x</SelectItem>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
              <SelectItem value="4">4x</SelectItem>
            </SelectContent>
          </Select>
          
           <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleZoomOut}><ZoomOut className="w-5 h-5" /></Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-auto px-3" onClick={handleZoomReset}>
                  {(state.zoom * 100).toFixed(0)}%
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset Zoom</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleZoomIn}><ZoomIn className="w-5 h-5"/></Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>
        </div>
      </div>
    </div>
  );
}
