import { useState, useEffect } from 'react';
import { projectRepository } from '../repositories/ProjectRepository';
import Project from '../models/Project';
import { Subscription } from 'rxjs';

interface UseProjectResult {
  project: Project | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useProject(id: string | null): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(id !== null);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchProject = async () => {
    if (!id) {
      setProject(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await projectRepository.getProjectById(id);
      setProject(data);
    } catch (err) {
      console.error(`Error in useProject for ID ${id}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setProject(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let subscription: Subscription;
    
    const initData = async () => {
      if (!id) {
        setProject(null);
        setLoading(false);
        return;
      }
      
      try {
        // Get initial data
        await fetchProject();
        
        // Subscribe to changes
        subscription = projectRepository.observeProject(id).subscribe(updatedProject => {
          setProject(updatedProject);
        });
      } catch (err) {
        console.error(`Error initializing useProject for ID ${id}:`, err);
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
  
  return { project, loading, error, refetch: fetchProject };
}
