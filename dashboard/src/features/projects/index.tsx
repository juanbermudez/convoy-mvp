import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Breadcrumb } from '@/components/breadcrumb'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { ProjectsDialogs } from './components/projects-dialogs'
import ProjectsProvider from './context/projects-context'
import { useProjects } from '@/hooks/useProjects'
import { SyncStatus } from '@/components/sync/SyncStatus'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Projects() {
  // Use the real data hook
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
            {/* Add the sync status component */}
            <SyncStatus />
          </div>
        </Header>

        <Main>
          <div className='flex-1 overflow-auto py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            {loading ? (
              // Show skeleton loading state
              <div className="space-y-4 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : error ? (
              // Show error state
              <Alert variant="destructive" className="mx-4 my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error.message || 'An error occurred while loading projects.'}
                </AlertDescription>
              </Alert>
            ) : projects.length === 0 ? (
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
                      d="M19 11V9a7 7 0 1 0-14 0v2m14 0v5a7 7 0 1 1-14 0v-5m14 0H5" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">No projects found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first project to get started
                </p>
                <Button 
                  onClick={() => {
                    // Trigger open project dialog through context
                    document.dispatchEvent(
                      new CustomEvent('open-create-project-dialog')
                    );
                  }}
                >
                  Create Project
                </Button>
              </div>
            ) : (
              // Show data table with projects
              <DataTable data={projects} columns={columns} />
            )}
          </div>
        </Main>
      </div>

      <ProjectsDialogs />
    </ProjectsProvider>
  )
}
