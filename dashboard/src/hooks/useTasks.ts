import { useState, useEffect } from 'react';
import { taskRepository, TaskFilters } from '../repositories/TaskRepository';
import Task from '../models/Task';
import { Subscription } from 'rxjs';

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
    let subscription: Subscription;
    
    const initData = async () => {
      try {
        // Get initial data
        await fetchTasks();
        
        // Subscribe to changes
        subscription = taskRepository.observeTasks(filters).subscribe(updatedTasks => {
          setTasks(updatedTasks);
        });
      } catch (err) {
        console.error('Error initializing useTasks:', err);
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
    let subscription: Subscription;
    
    const initData = async () => {
      if (!id) {
        setTask(null);
        setLoading(false);
        return;
      }
      
      try {
        // Get initial data
        await fetchTask();
        
        // Subscribe to changes
        subscription = taskRepository.observeTask(id).subscribe(updatedTask => {
          setTask(updatedTask);
        });
      } catch (err) {
        console.error(`Error initializing useTask for ID ${id}:`, err);
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
  
  return { task, loading, error, refetch: fetchTask };
}
