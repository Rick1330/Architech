
'use client';

import Logo from './logo';
import { Button } from './ui/button';
import {
  ChevronDown,
  Save,
  FilePlus,
  Share2,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppContext } from '@/contexts/app-context';
import { useEffect } from 'react';
import type { Project } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const { state, dispatch, api } = useAppContext();
  const { projects, currentProject, components, connections } = state;
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const fetchedProjects = await api.getProjects();
        dispatch({ type: 'SET_PROJECTS', payload: fetchedProjects });
        if (fetchedProjects.length > 0 && !currentProject) {
            dispatch({ type: 'SET_CURRENT_PROJECT', payload: fetchedProjects[0] });
        }
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch projects' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    fetchProjects();
  }, [dispatch, api]);

  const handleSelectProject = (project: Project) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
  }

  const handleNewProject = async () => {
    const newProjectName = prompt("Enter new project name:");
    if (!newProjectName) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newProject = await api.createProject(newProjectName);
      dispatch({ type: 'ADD_PROJECT_SUCCESS', payload: newProject });
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: newProject });
      toast({
        title: "Project Created",
        description: `Successfully created project "${newProjectName}".`,
      });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create project' });
       toast({
        variant: 'destructive',
        title: "Error",
        description: 'Failed to create project.',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleSaveProject = async () => {
    if (!currentProject) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.saveProject(currentProject.id, { components, connections });
      toast({
        title: "Project Saved",
        description: `Successfully saved "${currentProject.name}".`,
      });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save project' });
      toast({
        variant: 'destructive',
        title: "Error",
        description: 'Failed to save project.',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };


  return (
    <header className="flex items-center justify-between p-3 border-b shrink-0 bg-card">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="text-xl font-semibold text-foreground hidden sm:block">
            Architech Studio
          </h1>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex-1 flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" disabled={state.isLoading}>
              <span>{currentProject?.name || 'Select Project'}</span>
              <ChevronDown className="ml-2 w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Switch Project</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {projects.map(p => (
              <DropdownMenuItem key={p.id} onSelect={() => handleSelectProject(p)}>{p.name}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="Save Project" onClick={handleSaveProject} disabled={!currentProject || state.isLoading}>
          <Save />
        </Button>
        <Button variant="ghost" size="icon" title="New Project" onClick={handleNewProject} disabled={state.isLoading}>
          <FilePlus />
        </Button>
        <Button variant="ghost" size="icon" title="Share" disabled={state.isLoading}>
          <Share2 />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full p-0 w-8 h-8 ml-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
