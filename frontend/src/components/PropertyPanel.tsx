import { useArchitectStore, ComponentProperty } from '@/stores/useArchitectStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Settings, Activity, Terminal, X } from 'lucide-react';

export const PropertyPanel = () => {
  const { 
    nodes, 
    edges, 
    selectedNodeId, 
    selectedEdgeId, 
    updateNodeProperty,
    selectNode,
    selectEdge
  } = useArchitectStore();

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
  const selectedEdge = selectedEdgeId ? edges.find(e => e.id === selectedEdgeId) : null;

  const handleClearSelection = () => {
    selectNode(null);
    selectEdge(null);
  };

  const renderPropertyInput = (property: ComponentProperty) => {
    const handleChange = (value: string | number | boolean) => {
      if (selectedNodeId) {
        updateNodeProperty(selectedNodeId, property.id, value);
      }
    };

    switch (property.type) {
      case 'string':
        return (
          <Input
            value={String(property.value || '')}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${property.name.toLowerCase()}`}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={String(property.value || 0)}
            onChange={(e) => handleChange(Number(e.target.value))}
            min={property.min}
            max={property.max}
            step={property.step}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={String(property.value || '')}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${property.name.toLowerCase()}`}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <Select value={String(property.value || '')} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${property.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(property.value)}
              onCheckedChange={handleChange}
            />
            <span className="text-sm text-muted-foreground">
              {property.value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="w-80 bg-card border-l border-border h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Properties
          </h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Select a component or connection</p>
            <p className="text-xs mt-2">Click on any element in the canvas to view and edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-l border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Properties
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearSelection}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {selectedNode && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {selectedNode.type?.replace('-', ' ')}
            </Badge>
            <span className="text-sm font-medium truncate">
              {(selectedNode.data?.properties as ComponentProperty[])?.find((p: ComponentProperty) => p.id === 'name')?.value || selectedNode.id}
            </span>
          </div>
        )}
        
        {selectedEdge && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Connection
            </Badge>
            <span className="text-sm font-medium">
              {selectedEdge.source} → {selectedEdge.target}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <Tabs defaultValue="properties" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="properties" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Config
          </TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs">
            <Terminal className="h-3 w-3 mr-1" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="flex-1 mt-4">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {(selectedNode?.data?.properties as ComponentProperty[])?.map((property: ComponentProperty) => (
                <div key={property.id} className="space-y-2">
                  <Label htmlFor={property.id} className="text-sm font-medium">
                    {property.name}
                    {property.min !== undefined && property.max !== undefined && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({property.min}-{property.max})
                      </span>
                    )}
                  </Label>
                  {renderPropertyInput(property)}
                </div>
              ))}
              
              {(!selectedNode?.data?.properties || (selectedNode.data.properties as ComponentProperty[]).length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No configurable properties</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="metrics" className="flex-1 mt-4">
          <div className="p-4">
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Metrics will appear during simulation</p>
              <p className="text-xs mt-1">Start a simulation to see real-time metrics</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="flex-1 mt-4">
          <div className="p-4">
            <div className="text-center py-8 text-muted-foreground">
              <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Logs will appear during simulation</p>
              <p className="text-xs mt-1">Start a simulation to see component logs</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};