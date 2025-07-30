
'use client';
import { useMemo, useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PALETTE_COMPONENTS } from '@/lib/data';
import type { PaletteComponent } from '@/lib/types';
import { getComponentColor, cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Input } from './ui/input';
import { Search } from 'lucide-react';


function PaletteItem({ component, isExpanded }: { component: PaletteComponent, isExpanded: boolean }) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', component.id);
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  const bgColor = getComponentColor(component.category);

  if (!isExpanded) {
    return (
       <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                draggable
                onDragStart={handleDragStart}
                className="flex items-center justify-center p-2 transition-colors rounded-lg cursor-grab bg-card hover:bg-secondary active:cursor-grabbing"
              >
                <div className={cn("w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center", bgColor)}>
                  <component.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{component.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
    )
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center gap-3 p-2 transition-colors rounded-lg cursor-grab bg-card hover:bg-secondary active:cursor-grabbing"
    >
      <div className={cn("w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center", bgColor)}>
        <component.icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-sm font-medium text-foreground">{component.name}</span>
    </div>
  );
}

export default function ComponentPalette({ isExpanded }: { isExpanded: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const filteredComponents = useMemo(() => {
    if (!searchQuery) return PALETTE_COMPONENTS;
    return PALETTE_COMPONENTS.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const categorizedComponents = useMemo(() => {
    return filteredComponents.reduce((acc, component) => {
      const category = component.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(component);
      return acc;
    }, {} as Record<string, PaletteComponent[]>);
  }, [filteredComponents]);

  const categories = Object.keys(categorizedComponents);

  if (!isClient) {
    return null;
  }
  
  if (!isExpanded) {
    return (
      <ScrollArea className="h-full">
          <div className="flex flex-col items-center gap-2 pt-2">
            {PALETTE_COMPONENTS.map((component) => (
              <PaletteItem key={component.id} component={component} isExpanded={isExpanded} />
            ))}
          </div>
      </ScrollArea>
    )
  }

  return (
    <>
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search components..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="h-full pr-4">
        <Accordion type="multiple" defaultValue={categories} className="w-full px-4" key={searchQuery}>
          {categories.map((category) => (
            <AccordionItem value={category} key={category} className="border-b-0">
              <AccordionTrigger className="py-2 text-sm font-semibold hover:no-underline">{category}</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2 pt-2">
                  {categorizedComponents[category].map((component) => (
                    <PaletteItem key={component.id} component={component} isExpanded={isExpanded} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </>
  );
}
