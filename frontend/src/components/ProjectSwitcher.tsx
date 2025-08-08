import { useState } from 'react';
import { useArchitectStore } from '@/stores/useArchitectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Folder, 
  Clock, 
  Trash2, 
  Search,
  FolderOpen
} from 'lucide-react';

export const ProjectSwitcher = () => {
  const {
    currentProject,
    projects,
    showProjectSwitcher,
    toggleProjectSwitcher,
    createProject,
    loadProject,
    deleteProject,
    saveProject,
  } = useArchitectStore();

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim(), newProjectDescription.trim() || undefined);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateForm(false);
      toggleProjectSwitcher();
    }
  };

  const handleLoadProject = (projectId: string) => {
    if (currentProject) {
      saveProject(); // Auto-save current project
    }
    loadProject(projectId);
    toggleProjectSwitcher();
  };

  const formatLastModified = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={showProjectSwitcher} onOpenChange={toggleProjectSwitcher}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Project Manager
          </DialogTitle>
          <DialogDescription>
            Create new projects or switch between existing ones
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Create New Project */}
          <div className="space-y-3">
            {showCreateForm ? (
              <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
                <Input
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim()}
                    className="flex-1"
                  >
                    Create Project
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewProjectName('');
                      setNewProjectDescription('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full h-12 border-2 border-dashed border-border hover:border-primary/50 bg-transparent"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            )}
          </div>

          <Separator />

          {/* Projects List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No projects found</p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-primary/50 hover:bg-muted/30 ${
                    currentProject?.id === project.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border'
                  }`}
                  onClick={() => handleLoadProject(project.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{project.name}</h3>
                        {currentProject?.id === project.id && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatLastModified(project.lastModified)}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${project.name}"?`)) {
                          deleteProject(project.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};