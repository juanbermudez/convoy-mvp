import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { queryClient } from './lib/query-client';
import { initializeTheme } from './utils/theme-helpers';

// Initialize theme based on saved preference
initializeTheme();

// Initialize mock data for testing
import './mocks';

// Mount the app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
