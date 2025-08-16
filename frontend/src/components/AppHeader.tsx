import { Button } from '@/components/ui/button';
import { ProjectSwitcher } from '@/components/ProjectSwitcher';
import { UserMenu } from '@/components/auth/UserMenu';
import { 
  Save, 
  Upload, 
  Download, 
  Settings, 
  PanelLeftOpen, 
  PanelRightOpen,
  Layers,
  FolderOpen
} from 'lucide-react';
import { useArchitectStore } from '@/stores/useArchitectStore';

export const AppHeader = () => {
  const { 
    showComponentPalette, 
    showPropertyPanel, 
    currentProject,
    toggleComponentPalette, 
    togglePropertyPanel,
    toggleProjectSwitcher,
    saveProject
  } = useArchitectStore();

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left: Logo and Project */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Layers className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Architech
          </h1>
        </div>
        
        <div className="h-6 w-px bg-border" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleProjectSwitcher}
          className="flex items-center gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          <span className="font-medium">{currentProject?.name || 'Select Project'}</span>
        </Button>
      </div>

      {/* Center: Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={saveProject} className="hidden sm:flex">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Upload className="h-4 w-4 mr-2" />
          Load
        </Button>
        
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Right: Panel Controls and User */}
      <div className="flex items-center gap-2">
        <Button 
          variant={showComponentPalette ? "default" : "outline"} 
          size="sm"
          onClick={toggleComponentPalette}
          className="hidden md:flex"
        >
          <PanelLeftOpen className="h-4 w-4 mr-2" />
          Palette
        </Button>
        
        <Button 
          variant={showPropertyPanel ? "default" : "outline"} 
          size="sm"
          onClick={togglePropertyPanel}
          className="hidden md:flex"
        >
          <PanelRightOpen className="h-4 w-4 mr-2" />
          Properties
        </Button>
        
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
        
        <UserMenu />
      </div>
      
      <ProjectSwitcher />
    </header>
  );
};