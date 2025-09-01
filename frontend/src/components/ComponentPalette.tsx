import { useState } from 'react';
import { Search, Server, Database, MessageSquare, GitBranch, Layers, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface ComponentItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  nodeType: string;
  color: string;
}

const components: ComponentItem[] = [
  {
    id: 'generic-service',
    name: 'Generic Service',
    description: 'Microservice or application component',
    category: 'Services',
    icon: Server,
    nodeType: 'generic-service',
    color: 'node-service',
  },
  {
    id: 'database',
    name: 'Database',
    description: 'Data storage component',
    category: 'Storage',
    icon: Database,
    nodeType: 'database',
    color: 'node-database',
  },
  {
    id: 'message-queue',
    name: 'Message Queue',
    description: 'Message broker or queue system',
    category: 'Messaging',
    icon: MessageSquare,
    nodeType: 'message-queue',
    color: 'node-queue',
  },
  {
    id: 'load-balancer',
    name: 'Load Balancer',
    description: 'Distributes traffic across servers',
    category: 'Networking',
    icon: GitBranch,
    nodeType: 'load-balancer',
    color: 'node-loadbalancer',
  },
  {
    id: 'cache',
    name: 'Cache',
    description: 'Caching layer for performance',
    category: 'Storage',
    icon: Layers,
    nodeType: 'cache',
    color: 'node-cache',
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    description: 'Entry point for client requests',
    category: 'Networking',
    icon: Globe,
    nodeType: 'api-gateway',
    color: 'node-gateway',
  },
];

const categories = ['All', 'Services', 'Storage', 'Messaging', 'Networking'];

export const ComponentPalette = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredComponents = components.filter((component) => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 bg-card border-r border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Component Palette</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredComponents.map((component) => {
            const IconComponent = component.icon;
            return (
              <button
                key={component.id}
                className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-colors group w-full text-left"
                draggable
                onDragStart={(event) => onDragStart(event, component.nodeType)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Handle component selection
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className={`p-2 rounded-md flex-shrink-0 bg-${component.color}/20 group-hover:bg-${component.color}/30 transition-colors`}
                  >
                    <IconComponent className={`h-4 w-4 text-${component.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium truncate">{component.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {component.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {component.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredComponents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No components found</p>
              <p className="text-xs mt-1">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator />
      
      {/* Footer */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground">
          Drag components to the canvas to start building your architecture
        </p>
      </div>
    </div>
  );
};