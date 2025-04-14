import { useState, useEffect, useCallback } from 'react';
import { getTaskContext, TaskContext } from '@/lib/supabase/mcp';

/**
 * Hook for accessing the Memory Bank context in React components
 * This hook provides access to the complete context for a task
 * and handles loading state and errors
 */
export function useMemoryBank(taskId?: string) {
  const [context, setContext] = useState<TaskContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Retrieve context for a task
   */
  const fetchContext = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const taskContext = await getTaskContext(id);
      setContext(taskContext);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load context'));
      setContext(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reload the context
   */
  const refreshContext = useCallback(() => {
    if (taskId) {
      fetchContext(taskId);
    }
  }, [taskId, fetchContext]);

  // Load context when taskId changes
  useEffect(() => {
    if (taskId) {
      fetchContext(taskId);
    } else {
      setContext(null);
      setError(null);
      setIsLoading(false);
    }
  }, [taskId, fetchContext]);

  return {
    context,
    isLoading,
    error,
    refreshContext
  };
}

/**
 * Hook for traversing the Memory Bank hierarchy
 * This hook provides a way to navigate up and down the knowledge graph
 */
export function useMemoryBankNavigation(initialTaskId?: string) {
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>(initialTaskId);
  const { context, isLoading, error, refreshContext } = useMemoryBank(currentTaskId);

  /**
   * Navigate to parent task
   */
  const navigateToParent = useCallback(() => {
    if (context?.parent_task) {
      setCurrentTaskId(context.parent_task.id);
    }
  }, [context]);

  /**
   * Navigate to a subtask
   */
  const navigateToSubtask = useCallback((subtaskId: string) => {
    setCurrentTaskId(subtaskId);
  }, []);

  /**
   * Navigate to milestone
   */
  const navigateToMilestone = useCallback(() => {
    if (context) {
      // We would need to get a task from the milestone
      // This is a simplified approach - ideally we would get all tasks for the milestone
      // and select the first one or a specific one
      console.log('Navigate to milestone:', context.milestone.id);
      // For now, we just stay at the current task
    }
  }, [context]);

  /**
   * Navigate to project
   */
  const navigateToProject = useCallback(() => {
    if (context) {
      // Similar to milestone navigation, we would need a way to select a task within the project
      console.log('Navigate to project:', context.project.id);
      // For now, we just stay at the current task
    }
  }, [context]);

  /**
   * Navigate to workspace
   */
  const navigateToWorkspace = useCallback(() => {
    if (context) {
      // Similar to project navigation, we would need a way to select a task within the workspace
      console.log('Navigate to workspace:', context.workspace.id);
      // For now, we just stay at the current task
    }
  }, [context]);

  return {
    currentTaskId,
    setCurrentTaskId,
    context,
    isLoading,
    error,
    refreshContext,
    navigateToParent,
    navigateToSubtask,
    navigateToMilestone,
    navigateToProject,
    navigateToWorkspace
  };
}

export default useMemoryBank;
