import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@/renderer/lib/ipc';

/**
 * Project interface representing a project in the system
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook for fetching all projects
 */
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => invoke<Project[]>('projects:getAll'),
  });
}

/**
 * Hook for fetching a specific project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => invoke<Project>('projects:getById', id),
    enabled: !!id, // Only fetch when ID is available
  });
}

/**
 * Input for creating a new project
 */
export interface CreateProjectInput {
  name: string;
  description: string;
}

/**
 * Hook for creating a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateProjectInput) => 
      invoke<Project>('projects:create', input),
    onSuccess: () => {
      // Invalidate projects query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Input for updating a project
 */
export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
}

/**
 * Hook for updating an existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateProjectInput) => 
      invoke<Project>('projects:update', input),
    onSuccess: (updatedProject) => {
      // Update both the list and the individual project in the cache
      queryClient.invalidateQueries({ 
        queryKey: ['projects', updatedProject.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['projects'] 
      });
    },
  });
}

/**
 * Hook for deleting a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => invoke<void>('projects:delete', id),
    onSuccess: (_data, id) => {
      // Remove the project from the cache and update the list
      queryClient.removeQueries({ queryKey: ['projects', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
