import { createRootRoute } from '@tanstack/react-router';
import { BaseLayout } from '@/renderer/components/layout/BaseLayout';

/**
 * Root route that serves as the parent for all application routes
 * Uses the BaseLayout component to provide consistent layout structure
 */
export const rootRoute = createRootRoute({
  component: () => (
    <BaseLayout>
      {/* Outlet will be replaced with the component of the matched route */}
      <Outlet />
    </BaseLayout>
  ),
});

// Import Outlet after defining rootRoute to avoid circular dependencies
import { Outlet } from '@tanstack/react-router';
