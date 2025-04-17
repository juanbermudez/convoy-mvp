import { useState, useEffect } from 'react';
import { workstreamRepository } from '../repositories/WorkstreamRepository';
import Workstream from '../models/Workstream';
import { Subscription } from 'rxjs';

interface UseWorkstreamResult {
  workstream: Workstream | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useWorkstream(id: string | null): UseWorkstreamResult {
  const [workstream, setWorkstream] = useState<Workstream | null>(null);
  const [loading, setLoading] = useState<boolean>(id !== null);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchWorkstream = async () => {
    if (!id) {
      setWorkstream(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await workstreamRepository.getWorkstreamById(id);
      setWorkstream(data);
    } catch (err) {
      console.error(`Error in useWorkstream for ID ${id}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setWorkstream(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let subscription: Subscription;
    
    const initData = async () => {
      if (!id) {
        setWorkstream(null);
        setLoading(false);
        return;
      }
      
      try {
        // Get initial data
        await fetchWorkstream();
        
        // Subscribe to changes
        subscription = workstreamRepository.observeWorkstream(id).subscribe(updatedWorkstream => {
          setWorkstream(updatedWorkstream);
        });
      } catch (err) {
        console.error(`Error initializing useWorkstream for ID ${id}:`, err);
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
  
  return { workstream, loading, error, refetch: fetchWorkstream };
}
