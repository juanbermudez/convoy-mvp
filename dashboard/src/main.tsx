import { StrictMode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from '@/hooks/use-toast'
import { FontProvider } from './context/font-context'
import { ThemeProvider } from './context/theme-context'
import './index.css'
// Generated Routes
import { routeTree } from './routeTree.gen'
// Import database for initialization
import { database } from './models'
// Import SyncService for initialization
import { syncService } from './services/SyncService'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast({
              variant: 'destructive',
              title: 'Content not modified!',
            })
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast({
            variant: 'destructive',
            title: 'Session expired!',
          })
          useAuthStore.getState().auth.reset()
          const redirect = `${router.history.location.href}`
          router.navigate({ to: '/sign-in', search: { redirect } })
        }
        if (error.response?.status === 500) {
          toast({
            variant: 'destructive',
            title: 'Internal Server Error!',
          })
          router.navigate({ to: '/500' })
        }
        if (error.response?.status === 403) {
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Root component with database initialization
function Root() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await database.write(async () => {
          // No operation needed, just ensuring DB is ready
          console.log('Database initialized');
        });
        
        // Attempt to trigger initial sync
        if (navigator.onLine) {
          try {
            await syncService.sync();
            console.log('Initial sync completed');
          } catch (syncError) {
            console.error('Initial sync error (app will continue in offline mode):', syncError);
          }
        } else {
          console.log('Device is offline, skipping initial sync');
        }
        
        setDbReady(true);
      } catch (err) {
        console.error('Database initialization error:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };
    
    initializeApp();
    
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen flex-col p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md max-w-md mb-4">
          <h2 className="text-lg font-semibold mb-2">Database Error</h2>
          <p>{error.message}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium"
        >
          Reload App
        </button>
      </div>
    );
  }
  
  if (!dbReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
        <FontProvider>
          <RouterProvider router={router} />
        </FontProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Root />
    </StrictMode>
  )
}
