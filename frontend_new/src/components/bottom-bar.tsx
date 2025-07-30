
'use client';

import { useState, useRef, useEffect } from 'react';
import { BarChart, ListCollapse, Sparkles } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { Button } from './ui/button';
import SimulationControls from './simulation-controls';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MetricsDashboard from './metrics-dashboard';
import LogViewer from './log-viewer';
import AiAssistant from './ai-assistant';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

export default function BottomBar() {
    const { state, dispatch } = useAppContext();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
      <TooltipProvider>
        {/* Left Toolbar */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 p-1.5 bg-card border rounded-lg shadow-lg">
             <Dialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon"><ListCollapse /></Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Logs</p>
                  </TooltipContent>
                </Tooltip>
                <DialogContent className="max-w-4xl h-4/5 flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Log Viewer</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto">
                        <LogViewer />
                    </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon"><BarChart /></Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Metrics Dashboard</p>
                  </TooltipContent>
                </Tooltip>
                <DialogContent className="max-w-4xl h-4/5 flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Metrics Dashboard</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto">
                        <MetricsDashboard />
                    </div>
                </DialogContent>
              </Dialog>
                
              <Dialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Sparkles /></Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI Assistant</p>
                  </TooltipContent>
                </Tooltip>
                <DialogContent className="max-w-4xl h-4/5 flex flex-col">
                      <DialogHeader>
                        <DialogTitle>AI Design Assistant</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto">
                        <AiAssistant />
                    </div>
                </DialogContent>
              </Dialog>
        </div>
        
        {/* Center Toolbar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/5">
           <SimulationControls />
        </div>
      </TooltipProvider>
    );
}
