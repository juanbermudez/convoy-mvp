import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@/renderer/lib/ipc';

/**
 * Task interface representing a task in the system
 */
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook for fetching all tasks
 */
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => invoke<Task[]>('tasks:getAll'),
  });
}

/**
 * Hook for fetching tasks by project ID
 */
export function useTasksByProject(projectId: string) {
  return useQuery({
    queryKey: ['tasks', 'byProject', projectId],
    queryFn: () => invoke<Task[]>('tasks:getByProject', projectId),
    enabled: !!projectId, // Only fetch when projectId is available
  });
}

/**
 * Hook for fetching a specific task by ID
 */
export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => invoke<Task>('tasks:getById', id),
    enabled: !!id, // Only fetch when ID is available
  });
}

/**
 * Input for creating a new task
 */
export interface CreateTaskInput {
  projectId: string;
  title: string;
  description: string;
  status?: 'not-started' | 'in-progress' | 'completed';
}

/**
 * Hook for creating a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateTaskInput) => 
      invoke<Task>('tasks:create', input),
    onSuccess: (newTask) => {
      // Invalidate tasks queries to refetch the lists
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', 'byProject', newTask.projectId] 
      });
    },
  });
}

/**
 * Input for updating a task
 */
export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  status?: 'not-started' | 'in-progress' | 'completed';
}

/**
 * Hook for updating an existing task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateTaskInput) => 
      invoke<Task>('tasks:update', input),
    onSuccess: (updatedTask) => {
      // Update both the list and the individual task in the cache
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', updatedTask.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['tasks'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', 'byProject', updatedTask.projectId] 
      });
    },
  });
}

/**
 * Hook for deleting a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => invoke<void>('tasks:delete', id),
    onSuccess: (_data, id) => {
      // Get task from cache to know which project it belongs to
      const task = queryClient.getQueryData<Task>(['tasks', id]);
      
      // Remove the task from the cache and update the lists
      queryClient.removeQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // If we know the project ID, invalidate the project's task list
      if (task?.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: ['tasks', 'byProject', task.projectId] 
        });
      }
    },
  });
}
