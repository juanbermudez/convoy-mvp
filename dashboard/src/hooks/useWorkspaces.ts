import { useState, useEffect } from 'react';
import { workspaceRepository } from '../repositories/WorkspaceRepository';
import Workspace from '../models/Workspace';
import { Subscription } from 'rxjs';

interface UseWorkspacesResult {
  workspaces: Workspace[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useWorkspaces(): UseWorkspacesResult {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workspaceRepository.getWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      console.error('Error in useWorkspaces:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let subscription: Subscription;
    
    const initData = async () => {
      try {
        // Get initial data
        await fetchWorkspaces();
        
        // Subscribe to changes
        subscription = workspaceRepository.observeWorkspaces().subscribe(updatedWorkspaces => {
          setWorkspaces(updatedWorkspaces);
        });
      } catch (err) {
        console.error('Error initializing useWorkspaces:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };
    
    initData();
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);
  
  return { workspaces, loading, error, refetch: fetchWorkspaces };
}
