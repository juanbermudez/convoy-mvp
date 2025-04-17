/**
 * React hook for accessing tasks data
 */

import { useState, useEffect } from 'react';
import { taskRepository, Task, TaskFilters } from '../repositories/tasks';

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTasks(filters: TaskFilters = {}): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Stringify filters for dependency array
  const filtersKey = JSON.stringify(filters);
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskRepository.getTasks(filters);
      setTasks(data);
    } catch (err) {
      console.error('Error in useTasks:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Set up observer for tasks
    const unsubscribe = taskRepository.observeTasks(setTasks, filters);
    
    // Initial fetch
    fetchTasks();
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [filtersKey]);
  
  return { tasks, loading, error, refetch: fetchTasks };
}

interface UseTaskResult {
  task: Task | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTask(id: string | null): UseTaskResult {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(id !== null);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchTask = async () => {
    if (!id) {
      setTask(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await taskRepository.getTaskById(id);
      setTask(data);
    } catch (err) {
      console.error(`Error in useTask for ID ${id}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setTask(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!id) {
      setTask(null);
      setLoading(false);
      return () => {};
    }
    
    // Set up observer for task
    const unsubscribe = taskRepository.observeTask(setTask, id);
    
    // Initial fetch
    fetchTask();
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [id]);
  
  return { task, loading, error, refetch: fetchTask };
}
