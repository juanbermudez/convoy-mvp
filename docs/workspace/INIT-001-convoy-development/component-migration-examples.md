# Component Migration Examples

This document provides examples of how to migrate existing components to use our new offline-first data architecture. These examples will help ensure a smooth transition while maintaining compatibility with the rest of the codebase.

## Table of Contents

1. [Project List Component](#project-list-component)
2. [Task List Component](#task-list-component)
3. [Project Detail Component](#project-detail-component)
4. [Task Creation Dialog](#task-creation-dialog)
5. [Navigation Component](#navigation-component)

## Project List Component

### Before: Using Static Data

```tsx
// Before: /app/src/features/projects/index.tsx
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Breadcrumb } from '@/components/breadcrumb';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { ProjectsDialogs } from './components/projects-dialogs';
import ProjectsProvider from './context/projects-context';
import { projects } from './data/projects'; // Static data import

export default function Projects() {
  return (
    <ProjectsProvider>
      <div id="content" className="border rounded-lg overflow-hidden">
        <Header fixed>
          <div className="flex flex-1 w-full items-center">
            <Breadcrumb 
              items={[
                { label: 'Home' },
                { label: 'Projects' }
              ]} 
            />
          </div>
        </Header>

        <Main>
          <div className='flex-1 overflow-auto py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            <DataTable data={projects} columns={columns} />
          </div>
        </Main>
      </div>

      <ProjectsDialogs />
    </ProjectsProvider>
  );
}
```

### After: Using Offline-First Data Layer

```tsx
// After: /app/src/features/projects/index.tsx
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Breadcrumb } from '@/components/breadcrumb';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { ProjectsDialogs } from './components/projects-dialogs';
import ProjectsProvider from './context/projects-context';
import { useProjects } from '@/hooks/useProjects'; // New hook
import { SyncStatus } from '@/components/SyncStatus'; // New component
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // For error state
import { AlertCircle } from 'lucide-react';

export default function Projects() {
  // Use the new hook to get projects with offline support
  const { projects, loading, error } = useProjects();
  
  return (
    <ProjectsProvider>
      <div id="content" className="border rounded-lg overflow-hidden">
        <Header fixed>
          <div className="flex flex-1 w-full items-center justify-between">
            <Breadcrumb 
              items={[
                { label: 'Home' },
                { label: 'Projects' }
              ]} 
            />
            {/* Add sync status component */}
            <SyncStatus />
          </div>
        </Header>

        <Main>
          <div className='flex-1 overflow-auto py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            {loading ? (
              // Display loading skeleton
              <div className="space-y-4 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : error ? (
              // Display error message
              <Alert variant="destructive" className="mx-4 my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error.message || 'An error occurred while loading projects.'}
                </AlertDescription>
              </Alert>
            ) : (
              // Display projects table
              <DataTable data={projects} columns={columns} />
            )}
          </div>
        </Main>
      </div>

      <ProjectsDialogs />
    </ProjectsProvider>
  );
}
```

## Task List Component

### Before: Using Static Data

```tsx
// Before: /app/src/features/tasks/index.tsx
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Breadcrumb } from '@/components/breadcrumb';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { TasksDialogs } from './components/tasks-dialogs';
import TasksProvider from './context/tasks-context';
import { tasks } from './data/tasks'; // Static data import

export default function Tasks() {
  return (
    <TasksProvider>
      <div id="content" className="border rounded-lg overflow-hidden">
        <Header fixed>
          <div className="flex flex-1 w-full items-center">
            <Breadcrumb 
              items={[
                { label: 'Home' },
                { label: 'Tasks' }
              ]} 
            />
          </div>
        </Header>

        <Main>
          <div className='flex-1 overflow-auto py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            <DataTable data={tasks} columns={columns} />
          </div>
        </Main>
      </div>

      <TasksDialogs />
    </TasksProvider>
  );
}
```

### After: Using Offline-First Data Layer

```tsx
// After: /app/src/features/tasks/index.tsx
import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Breadcrumb } from '@/components/breadcrumb';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { TasksDialogs } from './components/tasks-dialogs';
import TasksProvider from './context/tasks-context';
import { useTasks } from '@/hooks/useTasks'; // New hook
import { useProjects } from '@/hooks/useProjects'; // For project filter
import { useWorkstreams } from '@/hooks/useWorkstreams'; // For workstream filter
import { SyncStatus } from '@/components/SyncStatus'; // New component
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // For error state
import { AlertCircle } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Filter, X } from 'lucide-react';

export default function Tasks() {
  // State for filters
  const [filters, setFilters] = useState({
    projectId: null,
    workstreamId: null,
    status: null,
    priority: null,
  });
  
  // Get filtered tasks with offline support
  const { tasks, loading, error } = useTasks(filters);
  
  // Get projects and workstreams for filters
  const { projects, loading: projectsLoading } = useProjects();
  const { workstreams, loading: workstreamsLoading } = useWorkstreams(
    filters.projectId ? { projectId: filters.projectId } : {}
  );
  
  // Reset filters function
  const resetFilters = () => {
    setFilters({
      projectId: null,
      workstreamId: null,
      status: null,
      priority: null,
    });
  };
  
  return (
    <TasksProvider>
      <div id="content" className="border rounded-lg overflow-hidden">
        <Header fixed>
          <div className="flex flex-1 w-full items-center justify-between">
            <Breadcrumb 
              items={[
                { label: 'Home' },
                { label: 'Tasks' }
              ]} 
            />
            <SyncStatus />
          </div>
        </Header>
        
        {/* Filter bar */}
        <div className="px-4 py-3 border-b flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Filter size={14} />
            <span>Filters:</span>
          </div>
          
          {/* Project filter */}
          <Select
            value={filters.projectId || ''}
            onValueChange={(value) => setFilters({ 
              ...filters, 
              projectId: value || null,
              // Reset workstream when project changes
              workstreamId: null 
            })}
          >
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Projects</SelectItem>
              {projectsLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading...</span>
                </div>
              ) : (
                projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          {/* Workstream filter (only if project is selected) */}
          {filters.projectId && (
            <Select
              value={filters.workstreamId || ''}
              onValueChange={(value) => setFilters({ 
                ...filters, 
                workstreamId: value || null 
              })}
            >
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="All Workstreams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Workstreams</SelectItem>
                {workstreamsLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  workstreams.map(workstream => (
                    <SelectItem key={workstream.id} value={workstream.id}>
                      {workstream.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
          
          {/* Status filter */}
          <Select
            value={filters.status || ''}
            onValueChange={(value) => setFilters({ ...filters, status: value || null })}
          >
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="to_do">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Priority filter */}
          <Select
            value={filters.priority || ''}
            onValueChange={(value) => setFilters({ ...filters, priority: value || null })}
          >
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Reset filters button */}
          {(filters.projectId || filters.workstreamId || filters.status || filters.priority) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="h-8 px-2"
            >
              <X size={14} className="mr-1" />
              Reset
            </Button>
          )}
        </div>

        <Main>
          <div className='flex-1 overflow-auto py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            {loading ? (
              // Display loading skeleton
              <div className="space-y-4 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : error ? (
              // Display error message
              <Alert variant="destructive" className="mx-4 my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error.message || 'An error occurred while loading tasks.'}
                </AlertDescription>
              </Alert>
            ) : tasks.length === 0 ? (
              // Display empty state
              <div className="flex flex-col items-center justify-center h-64 p-4">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-muted-foreground"
                  >
                    <path 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">No tasks found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {filters.projectId || filters.workstreamId || filters.status || filters.priority 
                    ? 'Try changing or resetting your filters'
                    : 'Create your first task to get started'}
                </p>
                <Button 
                  size="sm"
                  onClick={() => {
                    // Trigger open task dialog through context
                    document.dispatchEvent(
                      new CustomEvent('open-create-task-dialog')
                    );
                  }}
                >
                  Create Task
                </Button>
              </div>
            ) : (
              // Display tasks table
              <DataTable data={tasks} columns={columns} />
            )}
          </div>
        </Main>
      </div>

      <TasksDialogs />
    </TasksProvider>
  );
}
```

## Project Detail Component

### Before: Using Static Data

```tsx
// Before: /app/src/features/projects/components/project-detail.tsx
import { useParams } from '@tanstack/react-router';
import { ProjectHeader } from './project-header';
import { ProjectContent } from './project-content';
import { ProjectSidebar } from './project-sidebar';
import { projects } from '../data/projects'; // Static data import
import { NotFound } from '@/components/not-found';

export function ProjectDetail() {
  const { projectId } = useParams({ from: '/_authenticated/projects/$projectId' });
  
  // Find project in static data
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return <NotFound message="Project not found" />;
  }
  
  return (
    <div className="flex flex-col h-full">
      <ProjectHeader project={project} />
      <div className="flex flex-1 overflow-hidden">
        <ProjectContent project={project} />
        <ProjectSidebar project={project} />
      </div>
    </div>
  );
}
```

### After: Using Offline-First Data Layer

```tsx
// After: /app/src/features/projects/components/project-detail.tsx
import { useParams } from '@tanstack/react-router';
import { ProjectHeader } from './project-header';
import { ProjectContent } from './project-content';
import { ProjectSidebar } from './project-sidebar';
import { useProject } from '@/hooks/useProject'; // New hook
import { NotFound } from '@/components/not-found';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { SyncStatus } from '@/components/SyncStatus';

export function ProjectDetail() {
  const { projectId } = useParams({ from: '/_authenticated/projects/$projectId' });
  
  // Load project with offline support
  const { project, loading, error } = useProject(projectId);
  
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="flex space-x-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <div className="flex flex-1 p-4 space-x-4">
          <div className="flex-1">
            <Skeleton className="h-40 w-full mb-4" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="w-64">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || 'An error occurred while loading the project.'}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!project) {
    return <NotFound message="Project not found" />;
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <ProjectHeader project={project} />
        <SyncStatus />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <ProjectContent project={project} />
        <ProjectSidebar project={project} />
      </div>
    </div>
  );
}
```

## Task Creation Dialog

### Before: Using Static Data

```tsx
// Before: /app/src/features/tasks/components/create-task-dialog.tsx
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { projects } from '../../projects/data/projects'; // Static data import
import { workstreams } from '../../workstreams/data/workstreams'; // Static data import
import { useTasksContext } from '../context/tasks-context';

// Form schema
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  workstreamId: z.string().optional(),
  status: z.enum(['backlog', 'to_do', 'in_progress', 'review', 'completed']).default('backlog'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const { addTask } = useTasksContext();
  const { toast } = useToast();
  
  // Form setup
  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: '',
      workstreamId: '',
      status: 'backlog',
      priority: 'medium',
    },
  });
  
  // Get selected project ID
  const projectId = form.watch('projectId');
  
  // Filter workstreams by project
  const filteredWorkstreams = projectId 
    ? workstreams.filter(w => w.projectId === projectId)
    : [];
  
  // Submit handler
  const onSubmit = (data) => {
    // Generate fake ID
    const taskId = `task-${Math.floor(Math.random() * 10000)}`;
    
    // Create task with static data
    const newTask = {
      id: taskId,
      title: data.title,
      description: data.description || '',
      projectId: data.projectId,
      workstreamId: data.workstreamId || null,
      status: data.status,
      priority: data.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add task through context
    addTask(newTask);
    
    // Show success toast
    toast({
      title: 'Task created',
      description: 'Your task has been created successfully.',
    });
    
    // Close dialog and reset form
    setOpen(false);
    form.reset();
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Task</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Task description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="workstreamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workstream (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!projectId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workstream" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredWorkstreams.map((workstream) => (
                        <SelectItem key={workstream.id} value={workstream.id}>
                          {workstream.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="backlog">Backlog</SelectItem>
                        <SelectItem value="to_do">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### After: Using Offline-First Data Layer

```tsx
// After: /app/src/features/tasks/components/create-task-dialog.tsx
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useProjects } from '@/hooks/useProjects'; // New hook
import { useWorkstreams } from '@/hooks/useWorkstreams'; // New hook
import { taskRepository } from '@/repositories/TaskRepository'; // New repository
import { Loader2 } from 'lucide-react';

// Form schema
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  workstreamId: z.string().optional(),
  status: z.enum(['backlog', 'to_do', 'in_progress', 'review', 'completed']).default('backlog'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Load projects with offline support
  const { projects, loading: projectsLoading } = useProjects();
  
  // Form setup
  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: '',
      workstreamId: '',
      status: 'backlog',
      priority: 'medium',
    },
  });
  
  // Get selected project ID
  const projectId = form.watch('projectId');
  
  // Load workstreams filtered by selected project
  const { workstreams, loading: workstreamsLoading } = useWorkstreams(
    projectId ? { projectId } : null
  );
  
  // Reset workstream when project changes
  useEffect(() => {
    if (projectId) {
      form.setValue('workstreamId', '');
    }
  }, [projectId, form]);
  
  // Listen for external open events (used in empty state)
  useEffect(() => {
    const handleOpenDialog = () => {
      setOpen(true);
    };
    
    document.addEventListener('open-create-task-dialog', handleOpenDialog);
    
    return () => {
      document.removeEventListener('open-create-task-dialog', handleOpenDialog);
    };
  }, []);
  
  // Submit handler
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Create task using repository
      await taskRepository.createTask({
        title: data.title,
        description: data.description || '',
        projectId: data.projectId,
        workstreamId: data.workstreamId || null,
        status: data.status,
        priority: data.priority,
        labels: [],
      });
      
      // Show success toast
      toast({
        title: 'Task created',
        description: 'Your task has been created successfully.',
      });
      
      // Close dialog and reset form
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating task:', error);
      
      // Show error toast
      toast({
        variant: 'destructive',
        title: 'Failed to create task',
        description: error.message || 'An error occurred while creating the task.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Task</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Task description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={projectsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectsLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading projects...</span>
                        </div>
                      ) : (
                        projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="workstreamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workstream (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!projectId || workstreamsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workstream" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!projectId ? (
                        <div className="flex items-center justify-center py-2 text-muted-foreground">
                          <span>Select a project first</span>
                        </div>
                      ) : workstreamsLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading workstreams...</span>
                        </div>
                      ) : workstreams.length === 0 ? (
                        <div className="flex items-center justify-center py-2 text-muted-foreground">
                          <span>No workstreams available</span>
                        </div>
                      ) : (
                        workstreams.map((workstream) => (
                          <SelectItem key={workstream.id} value={workstream.id}>
                            {workstream.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="backlog">Backlog</SelectItem>
                        <SelectItem value="to_do">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

## Navigation Component

### Before: Using Static Data

```tsx
// Before: /app/src/components/navigation/side-nav.tsx
import { Link } from '@tanstack/react-router';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Settings 
} from 'lucide-react';

export function SideNav() {
  return (
    <div className="h-full w-16 lg:w-64 bg-slate-50 border-r flex flex-col">
      <div className="h-16 border-b flex items-center px-4">
        <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
        <span className="ml-2 font-semibold text-lg hidden lg:block">Convoy</span>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          <li>
            <Link 
              to="/"
              activeProps={{ className: 'bg-slate-200 text-slate-900' }}
              className="flex items-center h-10 px-3 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <LayoutDashboard size={20} />
              <span className="ml-3 hidden lg:block">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/projects"
              activeProps={{ className: 'bg-slate-200 text-slate-900' }}
              className="flex items-center h-10 px-3 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <FolderKanban size={20} />
              <span className="ml-3 hidden lg:block">Projects</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/tasks"
              activeProps={{ className: 'bg-slate-200 text-slate-900' }}
              className="flex items-center h-10 px-3 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <CheckSquare size={20} />
              <span className="ml-3 hidden lg:block">Tasks</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/users"
              activeProps={{ className: 'bg-slate-200 text-slate-900' }}
              className="flex items-center h-10 px-3 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <Users size={20} />
              <span className="ml-3 hidden lg:block">Users</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <Link 
          to="/settings"
          activeProps={{ className: 'bg-slate-200 text-slate-900' }}
          className="flex items-center h-10 px-3 rounded-md text-slate-600 hover:bg-slate-100"
        >
          <Settings size={20} />
          <span className="ml-3 hidden lg:block">Settings</span>
        </Link>
      </div>
    </div>
  );
}
```

### After: Using Offline-First Data Layer

```tsx
// After: /app/src/components/navigation/side-nav.tsx
import { Link } from '@tanstack/react-router';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Settings,
  CloudOff
} from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { syncService } from '@/services/SyncService';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

export function SideNav() {
  // Track sync status for offline indicator
  const [syncStatus, setSyncStatus] = useState({
    isOnline: navigator.onLine,
    syncInProgress: false,
    lastSyncTime: null
  });
  
  // Subscribe to sync status changes
  useEffect(() => {
    const unsubscribe = syncService.onSyncStatusChange(newStatus => {
      setSyncStatus(newStatus);
    });
    
    return unsubscribe;
  }, []);
  
  // Format the last sync time
  const formattedLastSync = syncStatus.lastSyncTime 
    ? formatDistanceToNow(syncStatus.lastSyncTime, { addSuffix: true }) 
    : 'never';
  
  // Sync button handler
  const handleSync = useCallback(() => {
    if (!syncStatus.isOnline || syncStatus.syncInProgress) return;
    syncService.sync().catch(console.error);
  }, [syncStatus.isOnline, syncStatus.syncInProgress]);
  
  return (
    <div className="h-full w-16 lg:w-64 bg-slate-50 border-r flex flex-col">
      <div className="h-16 border-b flex items-center px-4">
        <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
        <span className="ml-2 font-semibold text-lg hidden lg:block">Convoy</span>
      </div>
      
      {/* Offline indicator */}
      {!syncStatus.isOnline && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <CloudOff size={16} className="text-amber-500" />
            <span className="ml-2 text-amber-700 text-sm hidden lg:block">Offline Mode</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="hidden lg:flex border-amber-200 text-amber-600 text-xs">
                  {syncStatus.lastSyncTime ? `Synced ${formattedLastSync}` : 'Never synced'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Working offline. Changes will sync when you reconnect.</p>
                {syncStatus.lastSyncTime && (
                  <p className="text-xs mt-1">Last synced: {syncStatus.lastSyncTime.toLocaleString()}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          <li>
            <Link 
              to="/"
              activeProps={{ className: 'bg-slate-200 text-slate-900' }}
              className="flex items-center h-10 px-3 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <LayoutDashboard size={20} />
              <span className="ml-3 hidden lg:block">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/projects"
              activeProps={{ className: 'bg-slate-200 text-slate-900' }}
              className="flex items-center h-10 px-3 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <FolderKanban size={20} />
              <span className="ml-3 hidden lg:block">Projects</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/tasks"
              activeProps={{ className: 'bg-slate-200 text-slate-900' }}
              className="flex items-center h-10 px-3 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <CheckSquare size={20} />
              <span className="ml-3 hidden lg:block">Tasks</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/users"
              activeProps={{ className: 'bg-slate-200 text-slate-900' }}
              className="flex items-center h-10 px-3 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <Users size={20} />
              <span className="ml-3 hidden lg:block">Users</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <Link 
          to="/settings"
          activeProps={{ className: 'bg-slate-200 text-slate-900' }}
          className="flex items-center h-10 px-3 rounded-md text-slate-600 hover:bg-slate-100"
        >
          <Settings size={20} />
          <span className="ml-3 hidden lg:block">Settings</span>
        </Link>
      </div>
    </div>
  );
}
```

## Conclusion

These component migration examples demonstrate how to transition from using static data to our new offline-first data architecture. The updated components include:

1. **Loading States**: Skeleton loaders during data fetching
2. **Error Handling**: Error messages when data fetching fails
3. **Empty States**: User-friendly messages when no data is available
4. **Offline Indicators**: Visual cues when the app is offline
5. **Sync Status**: Information about the last synchronization
6. **Real-time Updates**: Components that react to data changes

By following these patterns, you can ensure a smooth transition to the offline-first architecture while maintaining a consistent user experience. Remember to:

- Update all components that consume data
- Add proper loading and error states
- Implement offline indicators where appropriate
- Add synchronization controls in strategic locations
- Test thoroughly in both online and offline scenarios
