import { useState } from 'react';
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Breadcrumb } from '@/components/breadcrumb'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { TasksDialogs } from './components/tasks-dialogs'
import TasksProvider from './context/tasks-context'
import { useTasks } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { useWorkstreams } from '@/hooks/useWorkstreams'
import { SyncStatus } from '@/components/sync/SyncStatus'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Filter, Loader2, X } from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export default function Tasks() {
  // State for filters
  const [filters, setFilters] = useState({
    projectId: null as string | null,
    workstreamId: null as string | null,
    status: null as string | null,
    priority: null as string | null,
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
            value={filters.projectId || 'all'}
            onValueChange={(value) => setFilters({ 
              ...filters, 
              projectId: value === 'all' ? null : value,
              // Reset workstream when project changes
              workstreamId: null 
            })}
          >
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
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
              value={filters.workstreamId || 'all'}
              onValueChange={(value) => setFilters({ 
                ...filters, 
                workstreamId: value === 'all' ? null : value 
              })}
            >
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="All Workstreams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workstreams</SelectItem>
                {workstreamsLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading...</span>
                  </div>
                ) : workstreams.length === 0 ? (
                  <div className="flex items-center justify-center py-2 text-muted-foreground">
                    <span>No workstreams found</span>
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
            value={filters.status || 'all'}
            onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? null : value })}
          >
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="to_do">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Priority filter */}
          <Select
            value={filters.priority || 'all'}
            onValueChange={(value) => setFilters({ ...filters, priority: value === 'all' ? null : value })}
          >
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
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
              // Show skeleton loading state
              <div className="space-y-4 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : error ? (
              // Show error state
              <Alert variant="destructive" className="mx-4 my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error.message || 'An error occurred while loading tasks.'}
                </AlertDescription>
              </Alert>
            ) : tasks.length === 0 ? (
              // Show empty state
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
              // Show data table with tasks
              <DataTable data={tasks} columns={columns} />
            )}
          </div>
        </Main>
      </div>

      <TasksDialogs />
    </TasksProvider>
  )
}
