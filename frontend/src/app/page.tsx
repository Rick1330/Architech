
'use client';
import { AppProvider, useAppContext } from '@/contexts/app-context';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import DesignCanvas from '@/components/design-canvas';
import BottomBar from '@/components/bottom-bar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyPanel from '@/components/property-panel';
import ConnectionPropertyPanel from '@/components/connection-property-panel';
import { Card } from '@/components/ui/card';
import { PALETTE_COMPONENTS } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

function AppContent() {
  const { state, dispatch, api } = useAppContext();
  const { toast } = useToast();
  
  const togglePalette = () => {
    dispatch({ type: 'TOGGLE_PALETTE' });
  };
  
  const selectedComponent = state.components.find(c => c.id === state.selectedComponentId);
  const selectedConnection = state.connections.find(c => c.id === state.selectedConnectionId);

  const handleAddComponent = async (componentId: string, position: { x: number; y: number }) => {
    if (!state.currentDesignId) return;

    const paletteComponent = PALETTE_COMPONENTS.find(p => p.id === componentId);
    if (!paletteComponent) return;
    
    try {
        const newComponentData = {
          type: paletteComponent.type,
          name: paletteComponent.name,
          icon: paletteComponent.icon,
          category: paletteComponent.category,
          position,
          status: 'ok',
          properties: {}, // Backend should populate this
      };
      const newComponent = await api.addComponent(state.currentDesignId, newComponentData);
      dispatch({ type: 'ADD_COMPONENT_SUCCESS', payload: newComponent });
    } catch(err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add component' });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add component' });
    }
  };

  const handleDeleteComponent = async (id: string) => {
    if (!state.currentDesignId) return;
    try {
      await api.deleteComponent(state.currentDesignId, id);
      dispatch({ type: 'DELETE_COMPONENT_SUCCESS', payload: { id } });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete component' });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete component' });
    }
  };

  const handleAddConnection = async (from: string, to: string) => {
    if (!state.currentDesignId) return;
    try {
      const newConnectionData = { from, to, properties: {} };
      const newConnection = await api.addConnection(state.currentDesignId, newConnectionData);
      dispatch({ type: 'ADD_CONNECTION_SUCCESS', payload: newConnection });
    } catch(err) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to create connection' });
       dispatch({ type: 'SET_ERROR', payload: 'Failed to create connection' });
    }
  };


  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <div className={cn("transition-all duration-300", state.isPaletteExpanded ? 'w-80' : 'w-20')}>
          <Sidebar isExpanded={state.isPaletteExpanded} />
        </div>
        
        <div className="flex items-center justify-center bg-border/50" style={{width: '18px'}}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-12 w-auto rounded-full bg-background/50 hover:bg-background"
              onClick={togglePalette}
            >
              {state.isPaletteExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
        </div>

        <div className="flex-1 flex flex-col relative">
          <DesignCanvas 
            onAddComponent={handleAddComponent} 
            onDeleteComponent={handleDeleteComponent}
            onAddConnection={handleAddConnection}
          />
          <BottomBar />
        </div>
        
        <div className={cn("transition-all duration-300 overflow-hidden", selectedComponent || selectedConnection ? 'w-[350px]' : 'w-0')}>
           { (selectedComponent || selectedConnection) && (
              <Card className="w-full h-full rounded-none border-t-0 border-b-0 border-r-0">
                {selectedComponent && <PropertyPanel key={selectedComponent.id} component={selectedComponent} />}
                {selectedConnection && <ConnectionPropertyPanel key={selectedConnection.id} connection={selectedConnection} />}
              </Card>
           )}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
