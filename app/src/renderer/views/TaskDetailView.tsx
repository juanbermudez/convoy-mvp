import React from 'react';
import { useParams } from 'react-router-dom';
import ActivityFeedItem from '../components/ActivityFeedItem';

// Placeholder data for demonstration
const placeholderTask = {
  id: 101,
  title: "Setup Project Structure",
  description: "Create the initial project structure including directory layouts, configuration files, and basic build setup.",
  status: "In Progress",
  priority: "High",
  assignee: "User",
  createdAt: "2023-01-15"
};

// Placeholder activity feed data
const placeholderActivityFeed = [
  { 
    id: 1, 
    timestamp: "2 hours ago", 
    author: "Cline AI", 
    content: "Task status changed from 'Todo' to 'In Progress'." 
  },
  { 
    id: 2, 
    timestamp: "3 hours ago", 
    author: "User", 
    content: "Added task description: 'Create the initial project structure including directory layouts, configuration files, and basic build setup.'" 
  },
  { 
    id: 3, 
    timestamp: "1 day ago", 
    author: "Cline AI", 
    content: "Created task 'Setup Project Structure' with priority 'High'." 
  }
];

// Helper function to get badge colors based on status
const getStatusBadgeClass = (status: string) => {
  switch(status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'in progress':
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

const TaskDetailView: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  
  // In a real implementation, we would fetch task details based on taskId
  const task = placeholderTask; // This would be fetched in a real implementation

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Task ID: {taskId || task.id} • Created: {task.createdAt}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content - Task Details */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {task.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</h4>
                <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityBadgeClass(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assignee</h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{task.assignee}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Checkpoints</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  No active checkpoints
                </span>
              </div>
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
            </div>
          </div>
        </div>

        {/* Sidebar - Activity Feed */}
        <div>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Activity Feed</h3>
            
            <div className="max-h-[600px] overflow-y-auto pb-2">
              {placeholderActivityFeed.map((activity) => (
                <ActivityFeedItem
                  key={activity.id}
                  timestamp={activity.timestamp}
                  author={activity.author}
                  content={activity.content}
                />
              ))}
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="flex space-x-3">
                <div className="min-w-0 flex-1">
                  <div className="border-b border-gray-300 focus-within:border-indigo-600 dark:border-gray-700">
                    <textarea
                      rows={3}
                      className="block w-full resize-none border-0 border-b border-transparent bg-transparent p-0 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-0 sm:text-sm dark:text-white dark:placeholder-gray-400"
                      placeholder="Add a comment..."
                      disabled
                    ></textarea>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Comment
                    </button>
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
