import { useState, useEffect } from 'react';
import { workstreamRepository, WorkstreamFilters } from '../repositories/WorkstreamRepository';
import Workstream from '../models/Workstream';
import { Subscription } from 'rxjs';

interface UseWorkstreamsResult {
  workstreams: Workstream[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useWorkstreams(filters: WorkstreamFilters = {}): UseWorkstreamsResult {
  const [workstreams, setWorkstreams] = useState<Workstream[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Stringify filters for dependency array
  const filtersKey = JSON.stringify(filters);
  
  const fetchWorkstreams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workstreamRepository.getWorkstreams(filters);
      setWorkstreams(data);
    } catch (err) {
      console.error('Error in useWorkstreams:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let subscription: Subscription;
    
    const initData = async () => {
      try {
        // Don't attempt to fetch if no project is selected when projectId is required
        if (filters.projectId === undefined && Object.keys(filters).length > 0) {
          setWorkstreams([]);
          setLoading(false);
          return;
        }
        
        // Get initial data
        await fetchWorkstreams();
        
        // Subscribe to changes
        subscription = workstreamRepository.observeWorkstreams(filters).subscribe(updatedWorkstreams => {
          setWorkstreams(updatedWorkstreams);
        });
      } catch (err) {
        console.error('Error initializing useWorkstreams:', err);
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
  }, [filtersKey]);
  
  return { workstreams, loading, error, refetch: fetchWorkstreams };
}

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
