/**
 * React hook for accessing projects data
 */

import { useState, useEffect } from 'react';
import { projectRepository, Project, ProjectFilters } from '../repositories/projects';

interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useProjects(filters: ProjectFilters = {}): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Stringify filters for dependency array
  const filtersKey = JSON.stringify(filters);
  
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectRepository.getProjects(filters);
      setProjects(data);
    } catch (err) {
      console.error('Error in useProjects:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Set up observer for projects
    const unsubscribe = projectRepository.observeProjects(setProjects, filters);
    
    // Initial fetch
    fetchProjects();
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [filtersKey]);
  
  return { projects, loading, error, refetch: fetchProjects };
}

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
    if (!id) {
      setProject(null);
      setLoading(false);
      return () => {};
    }
    
    // Set up observer for project
    const unsubscribe = projectRepository.observeProject(setProject, id);
    
    // Initial fetch
    fetchProject();
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [id]);
  
  return { project, loading, error, refetch: fetchProject };
}
