
'use client';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Connection } from '@/lib/types';
import { ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const renderPropertyInput = (
  connection: Connection,
  key: string,
  value: any,
  dispatch: React.Dispatch<any>
) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch({
      type: 'UPDATE_CONNECTION_PROPERTY',
      payload: { connectionId: connection.id, key, value: e.target.value },
    });
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.value === '' ? '' : Number(e.target.value);
    dispatch({
      type: 'UPDATE_CONNECTION_PROPERTY',
      payload: { connectionId: connection.id, key, value: numValue },
    });
  };
  
  const handleSelectChange = (newValue: string) => {
      dispatch({
          type: 'UPDATE_CONNECTION_PROPERTY',
          payload: { connectionId: connection.id, key, value: newValue },
      });
  };

  if (key === 'customProperties') {
    return <Textarea value={value} onChange={handleInputChange} id={`prop-${key}`} rows={5} />
  }

  if (key === 'protocol') {
    return (
     <Select value={value} onValueChange={handleSelectChange}>
         <SelectTrigger id={`prop-${key}`}><SelectValue /></SelectTrigger>
         <SelectContent>
             <SelectItem value="HTTP/S">HTTP/S</SelectItem>
             <SelectItem value="gRPC">gRPC</SelectItem>
             <SelectItem value="TCP">TCP</SelectItem>
             <SelectItem value="AMQP">AMQP</SelectItem>
         </SelectContent>
     </Select>
   );
 }
 
  if (typeof value === 'number') {
      return <Input type="number" value={value} onChange={handleNumberInputChange} id={`prop-${key}`} />;
  }

  if (key === 'name') {
    return <Input value={value} onChange={handleInputChange} id={`prop-${key}`} />;
  }

  return <Input value={value} onChange={handleInputChange} id={`prop-${key}`} disabled/>;
};

const ESSENTIAL_PROPS = ['protocol', 'latency', 'bandwidth', 'errorRate'];
const ADVANCED_PROPS = ['customProperties'];

interface ConnectionPropertyPanelProps {
  connection: Connection;
}

export default function ConnectionPropertyPanel({ connection }: ConnectionPropertyPanelProps) {
  const { state, dispatch, api } = useAppContext();
  const { toast } = useToast();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_CONNECTION_PROPERTY', payload: { connectionId: connection.id, key: 'name', value: e.target.value } });
  };
  
  const handleClose = () => {
    dispatch({ type: 'SELECT_CONNECTION', payload: { id: null } });
  }

  const handleSaveChanges = async () => {
    if (!state.currentDesignId) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.updateConnection(state.currentDesignId, connection.id, connection);
      toast({
        title: "Success",
        description: `Connection updated.`,
      });
      handleClose();
    } catch(err) {
       toast({
        variant: 'destructive',
        title: "Error",
        description: `Failed to update connection.`,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  const allProperties = connection.properties;

  const renderGroup = (keys: string[]) => {
      return keys.map(key => {
        if (!allProperties.hasOwnProperty(key)) return null;
        const value = allProperties[key];
        const input = renderPropertyInput(connection, key, value, dispatch);
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
        <div className={cn("w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center bg-muted")}>
           <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <Input
            id="connection-name"
            className="text-lg font-semibold border-none focus-visible:ring-1 focus-visible:ring-ring p-1 h-auto bg-transparent"
            value={connection.properties.name}
            onChange={handleNameChange}
          />
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 overflow-auto">
          <CardContent className="p-0">
             <Accordion type="single" collapsible defaultValue="essential" className="w-full">
                  <AccordionItem value="essential" className="border-none">
                      <AccordionTrigger className="text-sm font-medium py-3 px-4 hover:no-underline bg-muted/30">Connection Properties</AccordionTrigger>
                      <AccordionContent className="space-y-4 p-4 border-b">
                         {renderGroup(ESSENTIAL_PROPS)}
                      </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="advanced" className="border-none">
                      <AccordionTrigger className="text-sm font-medium py-3 px-4 hover:no-underline bg-muted/30">Advanced</AccordionTrigger>
                      <AccordionContent className="space-y-4 p-4 border-b">
                         {renderGroup(ADVANCED_PROPS)}
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
          </CardContent>
      </ScrollArea>

       <CardFooter className="flex justify-end gap-2 p-4 border-t bg-card/50">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSaveChanges} disabled={state.isLoading}>
            {state.isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
      </CardFooter>
    </div>
  );
}
