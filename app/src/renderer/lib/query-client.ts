import { QueryClient } from '@tanstack/react-query';

/**
 * Configure the React Query client with default options
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retain cached data for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000,
      
      // Retry failed queries 2 times
      retry: 2,
      
      // Refetch data on window focus
      refetchOnWindowFocus: true,
      
      // Don't refetch on component mount if data is available
      refetchOnMount: false,
    },
  },
});
