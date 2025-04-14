import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

/**
 * Projects route - displays a list of all projects
 */
export const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: Projects,
});

/**
 * Projects component displaying a list of projects
 * with options to create, filter, and search
 */
function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
          New Project
        </button>
      </div>
      
      <div className="rounded-lg border shadow-sm">
        <div className="p-6">
          <p className="text-center text-muted-foreground">No projects found. Create a new project to get started.</p>
        </div>
      </div>
    </div>
  );
}
