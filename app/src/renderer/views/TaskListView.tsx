import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Task } from '../types';

const TaskListView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("Loading...");

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    if (!projectId) {
      setError('Project ID is missing');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Check if the convoy API is available
      if (!window.convoy) {
        throw new Error('Convoy API not available. Backend connection not established.');
      }
      
      // Fetch tasks for the project
      const tasksData = await window.convoy.getTasks(projectId);
      setTasks(tasksData);
      
      // In a real implementation, we would fetch the project name too
      // For now, we'll set a placeholder based on the ID
      setProjectName(`Project ${projectId}`);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please check your settings and connection.');
      
      // Use placeholder data for development if API fails
      setTasks([
        { 
          id: "101", 
          title: "Setup Project Structure", 
          status: "completed", 
          priority: "high", 
          project_id: projectId || "1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: "102", 
          title: "Implement Auth Logic", 
          status: "development", 
          priority: "medium", 
          project_id: projectId || "1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: "103", 
          title: "Design Dashboard UI", 
          status: "todo", 
          priority: "medium", 
          project_id: projectId || "1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: "104", 
          title: "Write API Documentation", 
          status: "todo", 
          priority: "low", 
          project_id: projectId || "1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: "105", 
          title: "Setup CI/CD Pipeline", 
          status: "development", 
          priority: "high", 
          project_id: projectId || "1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      setProjectName('Convoy MVP'); // Placeholder
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine status style
  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'development':
      case 'code review':
      case 'testing':
      case 'deployment':
        return 'text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      case 'todo':
      case 'planning':
        return 'text-gray-800 bg-gray-100 dark:text-gray-300 dark:bg-gray-800';
      default:
        return 'text-gray-800 bg-gray-100 dark:text-gray-300 dark:bg-gray-800';
    }
  };

  // Helper function to determine priority style
  const getPriorityStyle = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high':
        return 'text-red-800 bg-red-100 dark:text-red-300 dark:bg-red-900';
      case 'medium':
        return 'text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900';
      case 'low':
        return 'text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900';
      default:
        return 'text-gray-800 bg-gray-100 dark:text-gray-300 dark:bg-gray-800';
    }
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Project: {projectName} {projectId ? `(ID: ${projectId})` : ''}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            to={`/projects`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            Back to Projects
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Task Table */}
      {!loading && (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Task Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Priority
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Assignee
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusStyle(task.status)}`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getPriorityStyle(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {task.assignee_id ? task.assignee_id : 'Unassigned'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link to={`/tasks/${task.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No tasks found for this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Actions Section */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => alert('AI Planning feature will be implemented in future updates')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          AI Plan Tasks
        </button>
      </div>
    </div>
  );
};

export default TaskListView;
