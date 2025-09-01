import { useState } from 'react';
import { useArchitectStore, ComponentProperty } from '@/stores/useArchitectStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { CodeEditor } from '@/components/CodeEditor';
import { 
  X, 
  Settings, 
  BarChart3, 
  FileText, 
  Info,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// Type alias for property change handlers to avoid repetition
type PropertyChangeHandler = (value: string | number | boolean) => void;

const MetricsChart = ({ title, value, max = 100, unit = '%', status = 'normal' }: {
  title: string;
  value: number;
  max?: number;
  unit?: string;
  status?: 'normal' | 'warning' | 'error';
}) => {
  const percentage = (value / max) * 100;
  const getColor = () => {
    if (status === 'error' || percentage > 90) return 'bg-status-error';
    if (status === 'warning' || percentage > 75) return 'bg-status-warning';
    return 'bg-status-active';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{title}</span>
        <span className="font-medium">{value}{unit}</span>
      </div>
      <Progress value={percentage} className={`h-2 ${getColor()}`} />
    </div>
  );
};

const EnhancedPropertyPanel = () => {
  const [activeTab, setActiveTab] = useState('config');
  
  const {
    selectedNodeId,
    selectedEdgeId,
    nodes,
    edges,
    nodeStatuses,
    updateNodeProperty,
    selectNode,
    selectEdge,
  } = useArchitectStore();

  type MetricStatusType = 'normal' | 'warning' | 'error';

const getMetricStatus = (value: number, warningThreshold: number, errorThreshold: number): MetricStatusType => {
    if (value > errorThreshold) return 'error';
    if (value > warningThreshold) return 'warning';
    return 'normal';
  };

  const getBadgeVariant = (level: string) => {
    if (level === 'error') return 'destructive';
    if (level === 'warn') return 'secondary';
    return 'outline';
  };

  const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) : null;
  const selectedEdge = selectedEdgeId ? edges.find(edge => edge.id === selectedEdgeId) : null;
  const nodeStatus = selectedNodeId ? nodeStatuses[selectedNodeId] : null;

  const handleClearSelection = () => {
    selectNode(null);
    selectEdge(null);
  };

  const renderStringProperty = (property: ComponentProperty, handleChange: PropertyChangeHandler, hasValidation: boolean) => (
    <div className="space-y-2">
      <Label htmlFor={property.id}>{property.name}</Label>
      <Input
        id={property.id}
        value={String(property.value || '')}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`Enter ${property.name.toLowerCase()}`}
        className={hasValidation ? 'border-status-error' : ''}
      />
      {hasValidation && (
        <p className="text-xs text-status-error">This field is required</p>
      )}
    </div>
  );

  const renderNumberProperty = (property: ComponentProperty, handleChange: PropertyChangeHandler) => (
    <div className="space-y-2">
      <Label htmlFor={property.id}>{property.name}</Label>
      <Input
        id={property.id}
        type="number"
        value={String(property.value || '')}
        onChange={(e) => handleChange(Number(e.target.value))}
        min={property.min}
        max={property.max}
        step={property.step}
        placeholder={`Enter ${property.name.toLowerCase()}`}
      />
    </div>
  );

  const renderSliderProperty = (property: ComponentProperty, handleChange: PropertyChangeHandler) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor={property.id}>{property.name}</Label>
        <span className="text-sm text-muted-foreground">{property.value || property.min || 0}</span>
      </div>
      <Slider
        value={[Number(property.value) || property.min || 0]}
        onValueChange={(values) => handleChange(values[0])}
        min={property.min || 0}
        max={property.max || 100}
        step={property.step || 1}
        className="w-full"
      />
    </div>
  );

  const renderTextareaProperty = (property: ComponentProperty, handleChange: PropertyChangeHandler) => (
    <div className="space-y-2">
      <Label htmlFor={property.id}>{property.name}</Label>
      <Textarea
        id={property.id}
        value={String(property.value || '')}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`Enter ${property.name.toLowerCase()}`}
        rows={3}
      />
    </div>
  );

  const renderSelectProperty = (property: ComponentProperty, handleChange: PropertyChangeHandler) => (
    <div className="space-y-2">
      <Label htmlFor={property.id}>{property.name}</Label>
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
    </div>
  );

  const renderBooleanProperty = (property: ComponentProperty, handleChange: PropertyChangeHandler) => (
    <div className="flex items-center justify-between">
      <Label htmlFor={property.id}>{property.name}</Label>
      <Switch
        id={property.id}
        checked={Boolean(property.value)}
        onCheckedChange={handleChange}
      />
    </div>
  );

  const renderCodeProperty = (property: ComponentProperty, handleChange: PropertyChangeHandler) => (
    <div className="space-y-2">
      <Label htmlFor={property.id}>{property.name}</Label>
      <CodeEditor
        value={typeof property.value === 'string' ? property.value : JSON.stringify(property.value || {}, null, 2)}
        onChange={(value) => {
          if (property.type === 'json') {
            try {
              handleChange(JSON.parse(value));
            } catch {
              handleChange(value); // Keep as string if invalid JSON
            }
          } else {
            handleChange(value);
          }
        }}
        language={property.type === 'json' ? 'json' : 'javascript'}
        placeholder={`Enter ${property.name.toLowerCase()}`}
        height="150px"
      />
    </div>
  );

  const renderPropertyInput = (property: ComponentProperty) => {
    const handleChange = (value: string | number | boolean) => {
      if (selectedNodeId) {
        updateNodeProperty(selectedNodeId, property.id, value);
      }
    };

    const hasValidation = property.validation?.required && !property.value;

    switch (property.type) {
      case 'string':
        return renderStringProperty(property, handleChange, hasValidation);
      case 'number':
        return renderNumberProperty(property, handleChange);
      case 'slider':
        return renderSliderProperty(property, handleChange);
      case 'textarea':
        return renderTextareaProperty(property, handleChange);
      case 'select':
        return renderSelectProperty(property, handleChange);
      case 'boolean':
        return renderBooleanProperty(property, handleChange);
      case 'json':
      case 'code':
        return renderCodeProperty(property, handleChange);
      default:
        return null;
    }
  };

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="w-80 h-full bg-card border-l border-border p-6">
        <div className="text-center text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Selection</h3>
          <p className="text-sm">
            Select a component or connection to view and edit its properties.
          </p>
        </div>
      </div>
    );
  }

  const isNode = !!selectedNode;
  const selectedItem = selectedNode || selectedEdge;
  const itemType = isNode ? selectedNode?.type || 'node' : 'connection';

  return (
    <div className="w-80 h-full bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {itemType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            {nodeStatus && (
              <div className="flex items-center gap-1">
                {nodeStatus.status === 'active' && <CheckCircle className="h-3 w-3 text-status-active" />}
                {nodeStatus.status === 'error' && <AlertCircle className="h-3 w-3 text-status-error" />}
                {nodeStatus.status === 'warning' && <AlertTriangle className="h-3 w-3 text-status-warning" />}
                <span className="text-xs capitalize">{nodeStatus.status}</span>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <h2 className="font-semibold text-lg truncate">
          {Array.isArray(selectedItem?.data?.properties) && 
           selectedItem.data.properties.find((p: ComponentProperty) => p.id === 'name')?.value || 
           selectedItem?.data?.label || 
           `${itemType} Properties`}
        </h2>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="config" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Config
          </TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs" disabled={!isNode || !nodeStatus?.metrics}>
            <BarChart3 className="h-3 w-3 mr-1" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs" disabled={!isNode || !nodeStatus?.logs}>
            <FileText className="h-3 w-3 mr-1" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="flex-1 m-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {Array.isArray(selectedItem?.data?.properties) && 
               selectedItem.data.properties.map((property: ComponentProperty) => (
                <div key={property.id}>
                  {renderPropertyInput(property)}
                </div>
              ))}
              
              {(!Array.isArray(selectedItem?.data?.properties) || selectedItem.data.properties.length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No configurable properties</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="metrics" className="flex-1 m-0">
          <ScrollArea className="h-full p-4">
            {nodeStatus?.metrics ? (
              <div className="space-y-6">
                <MetricsChart
                  title="CPU Usage"
                  value={nodeStatus.metrics.cpu}
                  status={getMetricStatus(nodeStatus.metrics.cpu, 60, 80)}
                />
                
                <MetricsChart
                  title="Memory Usage"
                  value={nodeStatus.metrics.memory}
                  status={getMetricStatus(nodeStatus.metrics.memory, 70, 85)}
                />
                
                <MetricsChart
                  title="Network I/O"
                  value={nodeStatus.metrics.requests}
                  max={1000}
                  unit=" req/s"
                />
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Performance
                  </h4>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg Latency</span>
                      <span className="font-medium">{nodeStatus.metrics.latency}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Requests/sec</span>
                      <span className="font-medium">{nodeStatus.metrics.requests}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No metrics available</p>
                <p className="text-xs mt-1">Start simulation to see real-time metrics</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="logs" className="flex-1 m-0">
          <ScrollArea className="h-full p-4">
            {nodeStatus?.logs && nodeStatus.logs.length > 0 ? (
              <div className="space-y-2">
                {nodeStatus.logs.map((log) => (
                  <div key={`${log.timestamp}-${log.level}-${log.message}`} className="p-2 bg-muted/30 rounded text-xs font-mono">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={getBadgeVariant(log.level)}
                        className="text-xs"
                      >
                        {log.level}
                      </Badge>
                      <span className="text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{log.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No logs available</p>
                <p className="text-xs mt-1">Logs will appear during simulation</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { EnhancedPropertyPanel };