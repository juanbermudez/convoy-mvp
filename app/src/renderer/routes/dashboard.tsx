import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

/**
 * Dashboard route - serves as the main landing page of the application
 */
export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

/**
 * Dashboard component displaying an overview of the user's activities,
 * recent projects, and tasks
 */
function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <p className="text-muted-foreground">No projects yet.</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Active Tasks</h2>
          <p className="text-muted-foreground">No active tasks.</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Activity Feed</h2>
          <p className="text-muted-foreground">No recent activity.</p>
        </div>
      </div>
    </div>
  );
}
