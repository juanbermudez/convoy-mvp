import { useQuery } from '@tanstack/react-query';
import { invoke } from '@/renderer/lib/ipc';

/**
 * Activity interface representing an activity in the system
 */
export interface Activity {
  id: string;
  type: string;
  taskId?: string;
  projectId?: string;
  timestamp: string;
  message: string;
}

/**
 * Hook for fetching all activities
 */
export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: () => invoke<Activity[]>('activities:getAll'),
  });
}

/**
 * Hook for fetching activities by project ID
 */
export function useActivitiesByProject(projectId: string) {
  return useQuery({
    queryKey: ['activities', 'byProject', projectId],
    queryFn: () => invoke<Activity[]>('activities:getByProject', projectId),
    enabled: !!projectId, // Only fetch when projectId is available
  });
}

/**
 * Hook for fetching activities by task ID
 */
export function useActivitiesByTask(taskId: string) {
  return useQuery({
    queryKey: ['activities', 'byTask', taskId],
    queryFn: () => invoke<Activity[]>('activities:getByTask', taskId),
    enabled: !!taskId, // Only fetch when taskId is available
  });
}

/**
 * Hook for fetching recent activities with pagination
 */
export function useRecentActivities(limit: number = 10) {
  return useQuery({
    queryKey: ['activities', 'recent', limit],
    queryFn: async () => {
      const activities = await invoke<Activity[]>('activities:getAll');
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
  });
}
