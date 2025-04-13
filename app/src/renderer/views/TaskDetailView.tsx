import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Task, ActivityFeedItem as ActivityFeedItemType, CheckpointInfo } from '../types';
import ActivityFeedItem from '../components/ActivityFeedItem';

const TaskDetailView: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [checkpoint, setCheckpoint] = useState<CheckpointInfo | null>(null);
  const [showApprovalButtons, setShowApprovalButtons] = useState<boolean>(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    if (!taskId) {
      setError('Task ID is missing');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Check if the convoy API is available
      if (!window.convoy) {
        throw new Error('Convoy API not available. Backend connection not established.');
      }
      
      // Fetch task details
      const taskData = await window.convoy.getTask(taskId);
      setTask(taskData);
      
      // Fetch activity feed
      const feedData = await window.convoy.getActivityFeed(taskId);
      setActivityFeed(feedData);
      
      // Check if task is at a checkpoint
      const checkpointData = await window.convoy.checkTaskCheckpoint(taskId);
      setCheckpoint(checkpointData);
      setShowApprovalButtons(!!checkpointData);
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError('Failed to load task details. Please check your settings and connection.');
      
      // Use placeholder data for development if API fails
      const placeholderTask = {
        id: taskId || "101",
        title: "Setup Project Structure",
        description: "Create the initial project structure including directory layouts, configuration files, and basic build setup.",
        status: "in progress",
        priority: "high",
        project_id: "1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setTask(placeholderTask as Task);
      
      // Placeholder activity feed
      const placeholderFeed = [
        { 
          id: "1", 
          timestamp: "2 hours ago", 
          agent_id: "cline-ai", 
          task_id: taskId,
          type: "STATUS_CHANGED",
          content: "Task status changed from 'Todo' to 'In Progress'." 
        },
        { 
          id: "2", 
          timestamp: "3 hours ago", 
          user_id: "user", 
          task_id: taskId,
          type: "USER_COMMENT",
          content: "Added task description: 'Create the initial project structure including directory layouts, configuration files, and basic build setup.'" 
        },
        { 
          id: "3", 
          timestamp: "1 day ago", 
          agent_id: "cline-ai", 
          task_id: taskId,
          type: "TASK_CREATED",
          content: "Created task 'Setup Project Structure' with priority 'High'." 
        }
      ];
      
      setActivityFeed(placeholderFeed as ActivityFeedItemType[]);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!taskId || !comment.trim()) return;
    
    try {
      setSubmitting(true);
      
      // Add the comment to the activity feed
      const newComment = await window.convoy.logActivity({
        task_id: taskId,
        user_id: "user", // In a real app, this would be the actual user ID
        type: "USER_COMMENT",
        content: comment
      });
      
      // Update the local activity feed
      setActivityFeed(prev => [newComment, ...prev]);
      
      // Clear the comment input
      setComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckpointResponse = async (approved: boolean) => {
    if (!taskId || !checkpoint) return;
    
    try {
      setSubmitting(true);
      
      // Process the checkpoint feedback
      await window.convoy.processCheckpointFeedback(
        taskId,
        comment || (approved ? "Approved checkpoint" : "Requested revisions"),
        approved
      );
      
      // Clear comment and hide approval buttons
      setComment('');
      setShowApprovalButtons(false);
      
      // Refresh task details to get updated status
      fetchTaskDetails();
    } catch (err) {
      console.error('Error processing checkpoint:', err);
      setError('Failed to process checkpoint response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to get badge colors based on status
  const getStatusBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in progress':
      case 'development':
      case 'code review':
      case 'testing':
      case 'deployment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Helper function to get badge colors based on priority
  const getPriorityBadgeClass = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 dark:text-red-400">Task not found or error loading task details.</p>
        <Link 
          to="/projects"
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Task ID: {taskId || task.id} • Created: {new Date(task.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            to={`/projects/${task.project_id}/tasks`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            Back to Tasks
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content - Task Details */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {task.description || 'No description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</h4>
                <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityBadgeClass(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assignee</h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{task.assignee_id || 'Unassigned'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{new Date(task.updated_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Checkpoints</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {checkpoint ? `At checkpoint: ${checkpoint.stage.name}` : 'No active checkpoints'}
                </span>
              </div>
              
              {checkpoint ? (
                <div className="mt-4 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Checkpoint Review Required</h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                        <p>
                          This task is at the "{checkpoint.stage.name}" checkpoint and requires review before proceeding.
                          {checkpoint.stage.checkpoint_artifact_type && 
                            ` This is a ${checkpoint.stage.checkpoint_artifact_type.toLowerCase().replace('_', ' ')} checkpoint.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        No action required at this time. Checkpoint information will appear here when the task reaches a review point.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Activity Feed */}
        <div>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Activity Feed</h3>
            
            <div className="max-h-[600px] overflow-y-auto pb-2">
              {activityFeed.length > 0 ? (
                activityFeed.map((activity) => (
                  <ActivityFeedItem
                    key={activity.id}
                    timestamp={activity.timestamp}
                    author={activity.user_id || activity.agent_id || 'System'}
                    content={activity.content}
                  />
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No activity recorded yet.</p>
              )}
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="flex space-x-3">
                <div className="min-w-0 flex-1">
                  <div className="border-b border-gray-300 focus-within:border-indigo-600 dark:border-gray-700">
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="block w-full resize-none border-0 border-b border-transparent bg-transparent p-0 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-0 sm:text-sm dark:text-white dark:placeholder-gray-400"
                      placeholder="Add a comment..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    {showApprovalButtons ? (
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleCheckpointResponse(true)}
                          disabled={submitting}
                          className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCheckpointResponse(false)}
                          disabled={submitting}
                          className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Request Revisions
                        </button>
                      </div>
                    ) : (
                      <div>
                        <button
                          type="button"
                          onClick={submitComment}
                          disabled={!comment.trim() || submitting}
                          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Comment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailView;
