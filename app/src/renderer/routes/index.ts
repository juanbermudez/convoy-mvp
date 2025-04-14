import { createRootRoute, createRouter } from '@tanstack/react-router';

// Root route definition - simple version for initial testing
export const rootRoute = createRootRoute();

// Create and export the router with just the root route for initial testing
export const router = createRouter({
  routeTree: rootRoute,
});

// For TypeScript type declarations
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
