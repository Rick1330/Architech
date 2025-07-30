
'use client';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function MetricCard({ title, value, unit }: { title: string; value: string | number; unit?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MetricsDashboard() {
  const { state, dispatch } = useAppContext();
  const { metrics, simulationState } = state;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (simulationState === 'RUNNING' && isClient) {
      intervalId = setInterval(() => {
        dispatch({
          type: 'UPDATE_LATENCY_HISTORY'
        });
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    }
  }, [simulationState, dispatch, isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <MetricCard title="Total Requests" value={metrics.totalRequests.toLocaleString()} />
        <MetricCard title="Avg. Latency" value={metrics.avgLatency.toFixed(0)} unit="ms" />
        <MetricCard title="Error Rate" value={`${(metrics.errorRate * 100).toFixed(2)}%`} />
        <MetricCard title="Throughput" value={metrics.throughput.toLocaleString()} unit="req/s" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Latency Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.latencyHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="ms" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }} 
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={simulationState === 'RUNNING'}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
