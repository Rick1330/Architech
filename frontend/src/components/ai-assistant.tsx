'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getDesignSuggestions } from '@/app/actions';
import { useAppContext } from '@/contexts/app-context';
import { Skeleton } from './ui/skeleton';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Inputs = {
  systemArchitecture: string;
  performanceMetrics: string;
  resilienceMetrics: string;
};

export default function AiAssistant() {
  const { state } = useAppContext();
  const { toast } = useToast();
  const { register, handleSubmit, setValue } = useForm<Inputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState('');

  const generateSystemSummary = () => {
    const componentSummary = state.components.map(c => `- ${c.name} (${c.type})`).join('\n');
    const connectionSummary = state.connections.map(c => {
        const from = state.components.find(comp => comp.id === c.from)?.name;
        const to = state.components.find(comp => comp.id === c.to)?.name;
        return `- Connection from ${from} to ${to}`;
    }).join('\n');
    
    setValue('systemArchitecture', `Components:\n${componentSummary}\n\nConnections:\n${connectionSummary}`);
    
    const metricsSummary = `Total Requests: ${state.metrics.totalRequests}\nAvg. Latency: ${state.metrics.avgLatency.toFixed(0)}ms\nError Rate: ${(state.metrics.errorRate * 100).toFixed(2)}%\nThroughput: ${state.metrics.throughput} req/s`;
    setValue('performanceMetrics', metricsSummary);
    setValue('resilienceMetrics', 'No fault injection or resilience patterns currently applied.');
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    setSuggestions('');
    try {
      const result = await getDesignSuggestions(data);
      if (result.suggestions) {
        setSuggestions(result.suggestions);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to get suggestions from the AI assistant.',
        });
      }
    } catch (error) {
       toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred.',
        });
      console.error(error);
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Wand2 /> AI Design Assistant</CardTitle>
        <CardDescription>Get AI-powered suggestions to optimize your system architecture.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="systemArchitecture">System Architecture</Label>
            <Textarea id="systemArchitecture" {...register('systemArchitecture')} rows={5} placeholder="Describe your system architecture..."/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="performanceMetrics">Performance Metrics</Label>
            <Textarea id="performanceMetrics" {...register('performanceMetrics')} rows={3} placeholder="Provide relevant performance metrics..."/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resilienceMetrics">Resilience Metrics</Label>
            <Textarea id="resilienceMetrics" {...register('resilienceMetrics')} rows={3} placeholder="Describe resilience tests or faults..."/>
          </div>
          <div className="flex justify-between items-center">
             <Button type="button" variant="outline" size="sm" onClick={generateSystemSummary}>
                Generate Summary from Canvas
             </Button>
             <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Get Suggestions'}
             </Button>
          </div>
        </form>

        {isLoading && (
            <div className="mt-6 space-y-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        )}

        {suggestions && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Optimization Suggestions</h3>
            <Card className="bg-secondary p-4">
                <pre className="text-sm whitespace-pre-wrap font-sans text-secondary-foreground">{suggestions}</pre>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
