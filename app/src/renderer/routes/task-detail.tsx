import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

/**
 * TaskDetail route - displays detailed information about a specific task
 */
export const taskDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks/$taskId',
  component: TaskDetail,
});

/**
 * TaskDetail component displaying information about a specific task
 * Shows task details, activity feed, and allows editing
 */
function TaskDetail() {
  const { taskId } = taskDetailRoute.useParams();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Task {taskId}</h1>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
            Edit
          </button>
          <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
            Back
          </button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border shadow-sm p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Description</h2>
                <p className="text-muted-foreground">Task description will appear here.</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold">Status</h2>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                  Not Started
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Activity</h2>
            <p className="text-muted-foreground">No activity yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
