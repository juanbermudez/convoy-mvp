import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

/**
 * Settings route - displays application settings
 */
export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

/**
 * Settings component for managing application configuration
 */
function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border shadow-sm divide-y">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">General</h2>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="app-name" className="text-sm font-medium leading-none">
                    Application Name
                  </label>
                  <input
                    id="app-name"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    value="Convoy"
                    readOnly
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none">
                      Dark Mode
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <div className="h-6 w-11 cursor-pointer rounded-full bg-muted p-1" role="checkbox">
                    <div className="h-4 w-4 rounded-full bg-background"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Advanced</h2>
              
              <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
                Reset Settings
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            
            <div className="space-y-2">
              <p className="text-sm">Version: 0.1.0</p>
              <p className="text-sm">Convoy MVP - AI Orchestration Platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
