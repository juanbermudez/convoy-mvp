---
title: Memory Bank React Hooks
description: Documentation of React hooks for accessing the Memory Bank
---

# Memory Bank React Hooks

This document describes the React hooks provided for accessing the Memory Bank in React components. These hooks make it easy to retrieve and work with task context in a React-friendly way.

## Overview

The Memory Bank hooks provide a React-friendly way to:

1. Retrieve the complete context for a task
2. Handle loading states and errors
3. Navigate the knowledge graph hierarchy
4. Refresh context when needed

These hooks follow React best practices and are designed for optimal integration with React components.

## useMemoryBank Hook

The primary hook for accessing the Memory Bank is `useMemoryBank`. This hook retrieves the complete context for a task and manages loading states and errors.

### Usage

```tsx
import { useMemoryBank } from '@/hooks/useMemoryBank';

function TaskDetailsComponent({ taskId }: { taskId: string }) {
  const { context, isLoading, error, refreshContext } = useMemoryBank(taskId);
  
  if (isLoading) {
    return <p>Loading task context...</p>;
  }
  
  if (error) {
    return <p>Error: {error.message}</p>;
  }
  
  if (!context) {
    return <p>No context found for task</p>;
  }
  
  return (
    <div>
      <h1>{context.task.title}</h1>
      <p>Stage: {context.task.current_stage}</p>
      <p>Status: {context.task.status}</p>
      <p>Milestone: {context.milestone.name}</p>
      <p>Project: {context.project.name}</p>
      <p>Workspace: {context.workspace.name}</p>
      
      <button onClick={refreshContext}>Refresh Context</button>
    </div>
  );
}
```

### Parameters

- `taskId`: The UUID of the task to retrieve context for. If not provided or undefined, no context will be retrieved.

### Return Value

The hook returns an object with the following properties:

- `context`: The complete task context, or `null` if no context has been retrieved yet.
- `isLoading`: A boolean indicating whether the context is currently being loaded.
- `error`: An error object if an error occurred while retrieving the context, or `null` if no error occurred.
- `refreshContext`: A function that can be called to refresh the context.

### Behavior

- When the hook is first called or when the `taskId` changes, it will automatically retrieve the context for the task.
- If the `taskId` is undefined, the hook will clear the context, error, and loading state.
- If an error occurs while retrieving the context, the error will be stored and exposed through the `error` property.
- The `refreshContext` function can be called to manually refresh the context (e.g., after updating the task).

## useMemoryBankNavigation Hook

The `useMemoryBankNavigation` hook extends `useMemoryBank` with navigation capabilities, allowing for traversal of the knowledge graph hierarchy.

### Usage

```tsx
import { useMemoryBankNavigation } from '@/hooks/useMemoryBank';

function TaskNavigationComponent({ initialTaskId }: { initialTaskId: string }) {
  const {
    currentTaskId,
    setCurrentTaskId,
    context,
    isLoading,
    error,
    navigateToParent,
    navigateToSubtask,
    navigateToMilestone,
    navigateToProject,
    navigateToWorkspace
  } = useMemoryBankNavigation(initialTaskId);
  
  if (isLoading) {
    return <p>Loading task context...</p>;
  }
  
  if (error) {
    return <p>Error: {error.message}</p>;
  }
  
  if (!context) {
    return <p>No context found for task</p>;
  }
  
  return (
    <div>
      <h1>{context.task.title}</h1>
      
      {/* Navigation controls */}
      <div className="navigation-controls">
        {context.parent_task && (
          <button onClick={navigateToParent}>
            Go to Parent Task: {context.parent_task.title}
          </button>
        )}
        
        {context.subtasks.length > 0 && (
          <div>
            <h3>Subtasks:</h3>
            <ul>
              {context.subtasks.map(subtask => (
                <li key={subtask.id}>
                  <button onClick={() => navigateToSubtask(subtask.id)}>
                    {subtask.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="hierarchy-navigation">
          <button onClick={navigateToMilestone}>
            Go to Milestone: {context.milestone.name}
          </button>
          <button onClick={navigateToProject}>
            Go to Project: {context.project.name}
          </button>
          <button onClick={navigateToWorkspace}>
            Go to Workspace: {context.workspace.name}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Parameters

- `initialTaskId`: The initial task ID to retrieve context for. This is optional.

### Return Value

The hook returns all the properties from `useMemoryBank` plus the following:

- `currentTaskId`: The current task ID being viewed.
- `setCurrentTaskId`: A function to directly set the current task ID.
- `navigateToParent`: A function to navigate to the parent task (if any).
- `navigateToSubtask`: A function that accepts a subtask ID and navigates to that subtask.
- `navigateToMilestone`: A function to navigate to the milestone level.
- `navigateToProject`: A function to navigate to the project level.
- `navigateToWorkspace`: A function to navigate to the workspace level.

### Behavior

- The hook maintains an internal state of the current task ID, starting with the `initialTaskId` if provided.
- Navigation functions update this internal state, triggering a context refresh for the new task.
- Hierarchy navigation (milestone, project, workspace) is simplified in the current implementation, as it requires a way to select a specific task within the higher-level entity.

## Custom Hook Examples

### Task Stage Management

Here's an example of a custom hook for managing task stages:

```tsx
import { useState, useCallback } from 'react';
import { useMemoryBank } from '@/hooks/useMemoryBank';
import { updateTaskStage } from '@/lib/supabase/mcp';

export function useTaskStageManagement(taskId: string) {
  const { context, refreshContext } = useMemoryBank(taskId);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const moveToStage = useCallback(async (newStage: string) => {
    if (!taskId) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      await updateTaskStage(taskId, newStage);
      await refreshContext();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task stage'));
    } finally {
      setIsUpdating(false);
    }
  }, [taskId, refreshContext]);
  
  const canMoveToStage = useCallback((stage: string) => {
    if (!context) return false;
    
    // Get current workflow stages
    const workflowStages = context.workflow.stages.stages || [];
    
    // Find the current stage in the workflow
    const currentStageIndex = workflowStages.findIndex(
      s => s.name === context.task.current_stage
    );
    
    // Find the target stage in the workflow
    const targetStageIndex = workflowStages.findIndex(
      s => s.name === stage
    );
    
    if (currentStageIndex === -1 || targetStageIndex === -1) {
      return false;
    }
    
    // Only allow moving to the next stage or a previous stage
    return targetStageIndex === currentStageIndex + 1 || targetStageIndex < currentStageIndex;
  }, [context]);
  
  return {
    currentStage: context?.task.current_stage,
    workflowStages: context?.workflow.stages.stages || [],
    moveToStage,
    canMoveToStage,
    isUpdating,
    error
  };
}
```

Usage in a component:

```tsx
function TaskStageControls({ taskId }: { taskId: string }) {
  const {
    currentStage,
    workflowStages,
    moveToStage,
    canMoveToStage,
    isUpdating,
    error
  } = useTaskStageManagement(taskId);
  
  if (!currentStage || workflowStages.length === 0) {
    return <p>Loading workflow stages...</p>;
  }
  
  return (
    <div className="stage-controls">
      <h3>Current Stage: {currentStage}</h3>
      
      {error && <p className="error">Error: {error.message}</p>}
      
      <div className="stage-buttons">
        {workflowStages.map(stage => (
          <button
            key={stage.name}
            disabled={!canMoveToStage(stage.name) || isUpdating || stage.name === currentStage}
            onClick={() => moveToStage(stage.name)}
          >
            Move to {stage.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Activity History Hook

Here's an example of a custom hook for tracking task activity:

```tsx
import { useState, useCallback } from 'react';
import { useMemoryBank } from '@/hooks/useMemoryBank';
import { addTaskActivity } from '@/lib/supabase/mcp';

export function useTaskActivityHistory(taskId: string) {
  const { context, refreshContext } = useMemoryBank(taskId);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const addActivity = useCallback(async (activityType: string, details: any) => {
    if (!taskId) return;
    
    setIsAddingActivity(true);
    setError(null);
    
    try {
      await addTaskActivity(taskId, activityType, details);
      await refreshContext();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add activity'));
    } finally {
      setIsAddingActivity(false);
    }
  }, [taskId, refreshContext]);
  
  const addComment = useCallback((comment: string) => {
    return addActivity('COMMENT', {
      comment,
      timestamp: new Date().toISOString()
    });
  }, [addActivity]);
  
  return {
    activities: context?.activities || [],
    isAddingActivity,
    error,
    addActivity,
    addComment
  };
}
```

Usage in a component:

```tsx
function TaskActivityFeed({ taskId }: { taskId: string }) {
  const [comment, setComment] = useState('');
  const { activities, isAddingActivity, error, addComment } = useTaskActivityHistory(taskId);
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    addComment(comment)
      .then(() => setComment(''));
  };
  
  return (
    <div className="activity-feed">
      <h3>Activity History</h3>
      
      {error && <p className="error">Error: {error.message}</p>}
      
      <ul className="activities">
        {activities.map(activity => (
          <li key={activity.id} className={`activity activity-${activity.activity_type.toLowerCase()}`}>
            <div className="activity-type">{activity.activity_type}</div>
            <div className="activity-time">
              {new Date(activity.created_at).toLocaleString()}
            </div>
            <div className="activity-details">
              {activity.activity_type === 'COMMENT' && (
                <p>{activity.details.comment}</p>
              )}
              {activity.activity_type === 'STAGE_CHANGE' && (
                <p>
                  Changed from {activity.details.from_stage} to {activity.details.to_stage}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      
      <form onSubmit={handleSubmitComment} className="comment-form">
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add a comment..."
          disabled={isAddingActivity}
        />
        <button type="submit" disabled={isAddingActivity || !comment.trim()}>
          {isAddingActivity ? 'Adding...' : 'Add Comment'}
        </button>
      </form>
    </div>
  );
}
```

## Performance Considerations

When using these hooks, keep the following performance considerations in mind:

1. **Context Retrieval**: The `useMemoryBank` hook performs multiple database queries to assemble the complete context. Be mindful of how frequently you trigger context retrieval.

2. **Dependencies**: The hooks use React's `useCallback` and `useEffect` with proper dependency arrays to minimize unnecessary re-renders and re-fetches.

3. **Refresh Strategy**: Consider when to call `refreshContext`. For example, after updating a task, you should refresh the context to ensure it reflects the latest state.

4. **Memoization**: When building components that use these hooks, consider using `React.memo` to prevent unnecessary re-renders.

## Error Handling

The hooks include comprehensive error handling:

1. **Error State**: All errors are captured and exposed through the `error` property.

2. **Fallbacks**: When an error occurs, the hooks provide `null` for the context, allowing components to display appropriate fallback UI.

3. **Recovery**: The `refreshContext` function can be used to try retrieving the context again after an error.

## Conclusion

The Memory Bank React hooks provide a convenient and React-friendly way to access the Convoy knowledge graph from your components. By using these hooks, you can easily retrieve context, navigate the hierarchy, and build rich user interfaces that leverage the complete task context.

These hooks form an important bridge between the Memory Bank pattern and the React UI components, making it easy to build context-aware interfaces that enhance the Convoy experience.
