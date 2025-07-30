
'use client';
import { useAppContext } from '@/contexts/app-context';
import { CardHeader, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { SystemComponentType, CanvasComponentData } from '@/lib/types';
import { getComponentColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import ComponentMetrics from './component-metrics';
import ComponentLogs from './component-logs';
import { FileText, BarChart2, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const renderPropertyInput = (
  componentId: string,
  key: string,
  value: any,
  dispatch: React.Dispatch<any>,
  componentType: SystemComponentType
) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch({
      type: 'UPDATE_COMPONENT_PROPERTY',
      payload: { componentId, key, value: e.target.value },
    });
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.value === '' ? '' : Number(e.target.value);
    dispatch({
      type: 'UPDATE_COMPONENT_PROPERTY',
      payload: { componentId, key, value: numValue },
    });
  };

  const handleSwitchChange = (checked: boolean) => {
      dispatch({
          type: 'UPDATE_COMPONENT_PROPERTY',
          payload: { componentId, key, value: checked },
      });
  };
  
  const handleSelectChange = (newValue: string) => {
      dispatch({
          type: 'UPDATE_COMPONENT_PROPERTY',
          payload: { componentId, key, value: newValue },
      });
  };

  if (key === 'description' || key === 'customProperties') {
    return <Textarea value={value} onChange={handleInputChange} id={`prop-${key}`} rows={key === 'customProperties' ? 5 : 3} />
  }

  if (typeof value === 'boolean') {
    return <Switch checked={value} onCheckedChange={handleSwitchChange} id={`prop-${key}`} />;
  }
  
  if (key === 'type') {
    if (componentType === 'Database') {
       return (
        <Select value={value} onValueChange={handleSelectChange}>
            <SelectTrigger id={`prop-${key}`}><SelectValue /></SelectTrigger>
            <SelectContent>
                <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                <SelectItem value="MongoDB">MongoDB</SelectItem>
                <SelectItem value="Redis">Redis</SelectItem>
                <SelectItem value="Cassandra">Cassandra</SelectItem>
            </SelectContent>
        </Select>
      );
    }
    if (componentType === 'MessageQueue') {
      return (
       <Select value={value} onValueChange={handleSelectChange}>
           <SelectTrigger id={`prop-${key}`}><SelectValue /></SelectTrigger>
           <SelectContent>
               <SelectItem value="Kafka">Kafka</SelectItem>
               <SelectItem value="RabbitMQ">RabbitMQ</SelectItem>
               <SelectItem value="SQS">SQS</SelectItem>
           </SelectContent>
       </Select>
     );
   }
   if (componentType === 'Cache') {
    return (
     <Select value={value} onValueChange={handleSelectChange}>
         <SelectTrigger id={`prop-${key}`}><SelectValue /></SelectTrigger>
         <SelectContent>
             <SelectItem value="Redis">Redis</SelectItem>
             <SelectItem value="Memcached">Memcached</SelectItem>
             <SelectItem value="In-Memory">In-Memory</SelectItem>
         </SelectContent>
     </Select>
   );
 }
  }

  if (key === 'algorithm') {
     return (
      <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger id={`prop-${key}`}><SelectValue /></SelectTrigger>
          <SelectContent>
              <SelectItem value="RoundRobin">Round Robin</SelectItem>
              <SelectItem value="LeastConnections">Least Connections</SelectItem>
              <SelectItem value="IPHash">IP Hash</SelectItem>
          </SelectContent>
      </Select>
    );
  }

  if (key === 'evictionPolicy') {
    return (
     <Select value={value} onValueChange={handleSelectChange}>
         <SelectTrigger id={`prop-${key}`}><SelectValue /></SelectTrigger>
         <SelectContent>
             <SelectItem value="LRU">LRU</SelectItem>
             <SelectItem value="LFU">LFU</SelectItem>
             <SelectItem value="FIFO">FIFO</SelectItem>
         </SelectContent>
     </Select>
   );
 }

 if (key === 'authentication') {
    return (
     <Select value={value} onValueChange={handleSelectChange}>
         <SelectTrigger id={`prop-${key}`}><SelectValue /></SelectTrigger>
         <SelectContent>
             <SelectItem value="OAuth2">OAuth2</SelectItem>
             <SelectItem value="JWT">JWT</SelectItem>
             <SelectItem value="APIKey">API Key</SelectItem>
             <SelectItem value="None">None</SelectItem>
         </SelectContent>
     </Select>
   );
 }
 
  if (typeof value === 'number') {
      return <Input type="number" value={value} onChange={handleNumberInputChange} id={`prop-${key}`} />;
  }

  if (key === 'name') {
    return null;
  }
  
  if (key === 'dependencies' || key === 'backendServices') {
      return <Input value={(value || []).join(', ')} disabled id={`prop-${key}`} />;
  }

  return <Input value={value} onChange={handleInputChange} id={`prop-${key}`} />;
};

const getPropertyGroups = (componentType: SystemComponentType) => {
    switch (componentType) {
        case 'GenericService':
            return {
                essential: ['instanceCount', 'cpu', 'memory'],
                advanced: ['description', 'requestPerSecond', 'latency', 'errorRate', 'dependencies', 'customProperties']
            };
        case 'Database':
            return {
                essential: ['type', 'storageCapacity', 'replicationFactor'],
                advanced: ['description', 'readLatency', 'writeLatency', 'maxConnections', 'customProperties']
            };
        case 'MessageQueue':
            return {
                essential: ['type', 'throughput', 'latency'],
                advanced: ['description', 'retentionPeriod', 'customProperties']
            };
        case 'LoadBalancer':
            return {
                essential: ['algorithm', 'healthCheckInterval'],
                advanced: ['description', 'backendServices', 'customProperties']
            };
        case 'Cache':
            return {
                essential: ['type', 'capacity', 'hitRate'],
                advanced: ['description', 'evictionPolicy', 'customProperties']
            };
        case 'APIGateway':
            return {
                essential: ['authentication', 'rateLimiting', 'requestPerSecondLimit'],
                advanced: ['description', 'customProperties']
            };
        default:
            return { essential: [], advanced: [] };
    }
}

interface PropertyPanelProps {
  component: CanvasComponentData;
}

export default function PropertyPanel({ component }: PropertyPanelProps) {
  const { state, dispatch, api } = useAppContext();
  const { toast } = useToast();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_COMPONENT_NAME', payload: { id: component.id, name: e.target.value } });
  };
  
  const handleClose = () => {
    dispatch({ type: 'SELECT_COMPONENT', payload: { id: null } });
  }

  const handleSaveChanges = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.updateComponent(state.currentDesignId!, component.id, component);
      toast({
        title: "Success",
        description: `Component "${component.name}" updated.`,
      });
      handleClose();
    } catch(err) {
       toast({
        variant: 'destructive',
        title: "Error",
        description: `Failed to update component.`,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  const { icon: Icon, category } = component;
  const bgColor = getComponentColor(category);
  
  const { essential, advanced } = getPropertyGroups(component.type);
  const allProperties = component.properties;

  const renderGroup = (keys: string[]) => {
      return keys.map(key => {
        if (!allProperties.hasOwnProperty(key)) return null;
        const value = allProperties[key];
        const input = renderPropertyInput(component.id, key, value, dispatch, component.type);
        if (!input) return null;
        return (
            <div key={key} className="space-y-2">
                <Label htmlFor={`prop-${key}`} className="capitalize text-sm font-medium">{key.replace(/([A-Z])/g, ' $1')}</Label>
                {input}
            </div>
        )
      })
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <CardHeader className="flex flex-row items-center gap-4 p-4 border-b bg-card/50">
        <div className={cn("w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center", bgColor)}>
           <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <Input
            id="component-name"
            className="text-lg font-semibold border-none focus-visible:ring-1 focus-visible:ring-ring p-1 h-auto bg-transparent"
            value={component.name}
            onChange={handleNameChange}
          />
        </div>
      </CardHeader>
      
      <Tabs defaultValue="properties" className="flex-1 flex flex-col">
         <TabsList className="grid w-full grid-cols-3 mx-auto px-4 rounded-none border-b">
            <TabsTrigger value="properties"><SlidersHorizontal/> Properties</TabsTrigger>
            <TabsTrigger value="metrics"><BarChart2/> Metrics</TabsTrigger>
            <TabsTrigger value="logs"><FileText/> Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="properties" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Accordion type="single" collapsible defaultValue="essential" className="w-full">
                    <AccordionItem value="essential" className="border-none">
                        <AccordionTrigger className="text-sm font-medium py-3 px-4 hover:no-underline bg-muted/30">Essential Settings</AccordionTrigger>
                        <AccordionContent className="space-y-4 p-4 border-b">
                           {renderGroup(essential)}
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="advanced" className="border-none">
                        <AccordionTrigger className="text-sm font-medium py-3 px-4 hover:no-underline bg-muted/30">Advanced Settings</AccordionTrigger>
                        <AccordionContent className="space-y-4 p-4 border-b">
                           {renderGroup(advanced)}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </ScrollArea>
        </TabsContent>
        <TabsContent value="metrics" className="flex-1 overflow-auto">
            <ScrollArea className="h-full">
                <div className="p-4">
                    <ComponentMetrics component={component} />
                </div>
            </ScrollArea>
        </TabsContent>
        <TabsContent value="logs" className="flex-1 overflow-auto">
             <ComponentLogs componentId={component.id} />
        </TabsContent>
      </Tabs>
      
       <CardFooter className="flex justify-end gap-2 p-4 border-t bg-card/50">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSaveChanges} disabled={state.isLoading}>
            {state.isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
      </CardFooter>
    </div>
  );
}
