import { AppHeader } from '@/components/AppHeader';
import { ComponentPalette } from '@/components/ComponentPalette';
import { ArchitectCanvas } from '@/components/ArchitectCanvas';
import { EnhancedPropertyPanel } from '@/components/EnhancedPropertyPanel';
import { SimulationTimeline } from '@/components/SimulationTimeline';
import { useArchitectStore } from '@/stores/useArchitectStore';
import { useSimulationEngine } from '@/hooks/useSimulationEngine';

const Index = () => {
  const { showComponentPalette, showPropertyPanel } = useArchitectStore();
  
  // Initialize simulation engine
  useSimulationEngine();

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {showComponentPalette && <ComponentPalette />}
        
        <div className="flex-1 flex flex-col">
          <ArchitectCanvas />
          <SimulationTimeline />
        </div>
        
        {showPropertyPanel && <EnhancedPropertyPanel />}
      </div>
    </div>
  );
};

export default Index;
