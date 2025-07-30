
'use client';

import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { CanvasComponentData } from '@/lib/types';
import { useEffect, useState } from 'react';

function MetricStat({ title, value, unit }: { title: string; value: string | number; unit?: string }) {
  return (
    <div className="flex flex-col items-start p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">{title}</p>
        <div className="text-lg font-bold">
          {value}
          {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
    </div>
  );
}

interface ComponentMetricsProps {
    component: CanvasComponentData;
}

const initialHistory = Array.from({ length: 20 }, () => ({ time: 0, usage: 0 }));

export default function ComponentMetrics({ component }: ComponentMetricsProps) {
    const { state } = useAppContext();
    const { simulationState } = state;
    const [cpuHistory, setCpuHistory] = useState(initialHistory);
    const [memoryHistory, setMemoryHistory] = useState(initialHistory);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || simulationState !== 'RUNNING') {
          if (simulationState !== 'RUNNING') {
              setCpuHistory(initialHistory);
              setMemoryHistory(initialHistory);
          }
          return;
        }

        const intervalId = setInterval(() => {
            const newCpu = Math.min(100, Math.max(0, Math.random() * 20 + (component.properties.cpu || 0.5) * 20 - 10));
            const newMemory = Math.min(100, Math.max(0, Math.random() * 20 + (component.properties.memory / 1024) * 20 - 10));

            setCpuHistory(prev => [...prev.slice(1), { time: Date.now(), usage: newCpu }]);
            setMemoryHistory(prev => [...prev.slice(1), { time: Date.now(), usage: newMemory }]);
        }, 2000);
        

        return () => {
          if (intervalId) clearInterval(intervalId);
        }
    }, [simulationState, component.properties.cpu, component.properties.memory, isClient]);
    
    if (!isClient) {
        return null;
    }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
           <CardTitle className="text-base">Real-time Stats</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-3">
                <MetricStat title="Instances" value={component.properties.instanceCount || 1} />
                <MetricStat title="Avg Latency" value={component.properties.latency || 0} unit="ms" />
                <MetricStat title="Error Rate" value={`${(component.properties.errorRate || 0).toFixed(2)}%`} />
                <MetricStat title="Req/s" value={component.properties.requestPerSecond || 0} />
            </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="text-base">CPU Usage (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }} 
                />
                <Area type="monotone" dataKey="usage" stroke="hsl(var(--primary))" fill="url(#colorCpu)" strokeWidth={2} dot={false} isAnimationActive={simulationState === 'RUNNING'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Memory Usage (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memoryHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                 <defs>
                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }} 
                />
                <Area type="monotone" dataKey="usage" stroke="hsl(var(--accent))" fill="url(#colorMemory)" strokeWidth={2} dot={false} isAnimationActive={simulationState === 'RUNNING'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
