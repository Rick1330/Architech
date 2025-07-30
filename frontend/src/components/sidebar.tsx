
'use client';
import { useState, useEffect } from 'react';
import { 
    Shapes, 
    Folder, 
    PlaySquare, 
    FileText,
    Grid,
    Package
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import ComponentPalette from './component-palette';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

function ProjectExplorer({ isExpanded }: { isExpanded: boolean }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    if (!isExpanded) {
        return (
            <div className="flex flex-col items-center gap-4 pt-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-lg"><Folder /></Button>
                    </TooltipTrigger>
                    <TooltipContent side="right"><p>Architectures</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-lg"><PlaySquare /></Button>
                    </TooltipTrigger>
                    <TooltipContent side="right"><p>Simulations</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-lg"><FileText /></Button>
                    </TooltipTrigger>
                    <TooltipContent side="right"><p>Reports</p></TooltipContent>
                </Tooltip>
            </div>
        );
    }

    return (
        <div className="p-4">
             <Accordion type="multiple" defaultValue={['architectures']} className="w-full">
                <AccordionItem value="architectures">
                    <AccordionTrigger className="text-sm"><Folder className="mr-2" /> Architectures</AccordionTrigger>
                    <AccordionContent className="pl-6 text-muted-foreground">
                        <p className="py-1">Project Alpha</p>
                        <p className="py-1">Project Beta</p>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="simulations">
                    <AccordionTrigger className="text-sm"><PlaySquare className="mr-2" /> Simulations</AccordionTrigger>
                    <AccordionContent className="pl-6 text-muted-foreground">
                        <p className="py-1">Run 2024-07-22</p>
                        <p className="py-1">Run 2024-07-21</p>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="reports">
                    <AccordionTrigger className="text-sm"><FileText className="mr-2" /> Reports</AccordionTrigger>
                     <AccordionContent className="pl-6 text-muted-foreground">
                        <p className="py-1">Q2 Performance</p>
                        <p className="py-1">Cost Analysis</p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default function Sidebar({ isExpanded }: { isExpanded: boolean }) {
    const tabStyle = "flex items-center justify-center p-2.5 h-auto rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground";

    if (!isExpanded) {
        return (
            <aside className="h-full p-2 border-r bg-card shrink-0 overflow-hidden">
                <TooltipProvider>
                    <Tabs defaultValue="components" className="w-full flex" orientation="vertical">
                        <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-2">
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <TabsTrigger value="components" className={tabStyle}><Package /></TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="right"><p>Components</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <TabsTrigger value="explorer" className={tabStyle}><Folder /></TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="right"><p>Project Explorer</p></TooltipContent>
                            </Tooltip>
                        </TabsList>
                        {/* Hidden content for compact mode, maybe render it in a popover or sheet later */}
                    </Tabs>
                </TooltipProvider>
            </aside>
        )
    }


    return (
        <aside className={cn("h-full border-r bg-card flex flex-col transition-all duration-300", isExpanded ? "w-80" : "w-20")}>
            <Tabs defaultValue="components" className="w-full flex-1 flex flex-col">
                <div className="p-2 border-b">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="components"><Shapes className="mr-2 h-4 w-4"/> Components</TabsTrigger>
                        <TabsTrigger value="explorer"><Folder className="mr-2 h-4 w-4"/> Explorer</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="components" className="flex-1 flex flex-col overflow-hidden">
                    <ComponentPalette isExpanded={isExpanded} />
                </TabsContent>
                <TabsContent value="explorer" className="flex-1 overflow-auto">
                    <ProjectExplorer isExpanded={isExpanded} />
                </TabsContent>
            </Tabs>
        </aside>
    );
}
