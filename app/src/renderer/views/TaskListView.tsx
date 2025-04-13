import React from 'react';
import { Link, useParams } from 'react-router-dom';

// Placeholder data for demonstration
const placeholderTasks = [
  { id: 101, title: "Setup Project Structure", status: "Completed", priority: "High", assignee: "User" },
  { id: 102, title: "Implement Auth Logic", status: "In Progress", priority: "Medium", assignee: "User" },
  { id: 103, title: "Design Dashboard UI", status: "Todo", priority: "Medium", assignee: "Unassigned" },
  { id: 104, title: "Write API Documentation", status: "Todo", priority: "Low", assignee: "Unassigned" },
  { id: 105, title: "Setup CI/CD Pipeline", status: "In Progress", priority: "High", assignee: "Cline AI" },
];

// Helper function to determine status style
const getStatusStyle = (status: string) => {
  switch(status.toLowerCase()) {
    case 'completed':
      return 'text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900';
    case 'in progress':
      return 'text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
    case 'todo':
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

const TaskListView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  // In a real implementation, we would fetch tasks for the specific projectId
  const projectName = "Convoy MVP"; // Placeholder, would be fetched in real implementation

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Project: {projectName} {projectId ? `(ID: ${projectId})` : ''}
          </p>
        </div>
      </div>

      {/* Task Table */}
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
            {placeholderTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusStyle(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getPriorityStyle(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {task.assignee}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link to={`/tasks/${task.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskListView;
