import { useState, useEffect } from 'react';
import { workspaceRepository } from '../repositories/WorkspaceRepository';
import Workspace from '../models/Workspace';
import { Subscription } from 'rxjs';

interface UseWorkspaceResult {
  workspace: Workspace | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useWorkspace(id: string | null): UseWorkspaceResult {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState<boolean>(id !== null);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchWorkspace = async () => {
    if (!id) {
      setWorkspace(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await workspaceRepository.getWorkspaceById(id);
      setWorkspace(data);
    } catch (err) {
      console.error(`Error in useWorkspace for ID ${id}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setWorkspace(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let subscription: Subscription;
    
    const initData = async () => {
      if (!id) {
        setWorkspace(null);
        setLoading(false);
        return;
      }
      
      try {
        // Get initial data
        await fetchWorkspace();
        
        // Subscribe to changes
        subscription = workspaceRepository.observeWorkspace(id).subscribe(updatedWorkspace => {
          setWorkspace(updatedWorkspace);
        });
      } catch (err) {
        console.error(`Error initializing useWorkspace for ID ${id}:`, err);
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
  }, [id]);
  
  return { workspace, loading, error, refetch: fetchWorkspace };
}
