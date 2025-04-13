import React from 'react';
import { Link } from 'react-router-dom';

// Placeholder data for demonstration
const placeholderProjects = [
  { id: 1, name: "Convoy MVP", status: "In Progress", tasks: 8, completedTasks: 3 },
  { id: 2, name: "Documentation Site", status: "Planning", tasks: 5, completedTasks: 0 },
  { id: 3, name: "Analytics Dashboard", status: "Completed", tasks: 12, completedTasks: 12 },
];

const ProjectListView: React.FC = () => {
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
        <div className="mt-4 md:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled
          >
            New Project
          </button>
        </div>
      </div>

      {/* Project Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderProjects.map((project) => {
          // Determine status color
          let statusColor = "text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800";
          if (project.status === "In Progress") {
            statusColor = "text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900";
          } else if (project.status === "Completed") {
            statusColor = "text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900";
          } else if (project.status === "Planning") {
            statusColor = "text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900";
          }
          
          return (
            <div 
              key={project.id}
              className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
            >
              <div className="px-6 py-5">
                <Link to={`/projects/${project.id}/tasks`} className="hover:underline">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {project.name}
                  </h3>
                </Link>
                <div className="mt-2 flex items-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                    {project.status}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Progress</span>
                    <span>{project.completedTasks} of {project.tasks} tasks</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full dark:bg-indigo-500" 
                      style={{ width: `${(project.completedTasks / project.tasks) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex justify-end">
                <Link 
                  to={`/projects/${project.id}/tasks`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  View Tasks →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectListView;
