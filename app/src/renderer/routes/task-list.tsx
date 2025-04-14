import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

/**
 * TaskList route - displays a list of all tasks
 */
export const taskListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: TaskList,
});

/**
 * TaskList component displaying a list of tasks
 * with options to filter by status, priority, etc.
 */
function TaskList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
          New Task
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <div className="rounded-md border px-3 py-1 text-sm bg-background">All</div>
        <div className="rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-accent cursor-pointer">In Progress</div>
        <div className="rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-accent cursor-pointer">Completed</div>
      </div>
      
      <div className="rounded-lg border shadow-sm">
        <div className="p-6">
          <p className="text-center text-muted-foreground">No tasks found. Create a new task to get started.</p>
        </div>
      </div>
    </div>
  );
}
