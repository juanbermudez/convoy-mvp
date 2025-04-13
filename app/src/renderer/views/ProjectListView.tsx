import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';

const ProjectListView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState<boolean>(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState<boolean>(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if the convoy API is available
      if (!window.convoy) {
        throw new Error('Convoy API not available. Backend connection not established.');
      }
      
      const projectsData = await window.convoy.getProjects();
      setProjects(projectsData);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please check your settings and connection.');
      
      // Use placeholder data for development if API fails
      setProjects([
        { 
          id: "1", 
          name: "Convoy MVP", 
          status: "active", 
          organization_id: "1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: "2", 
          name: "Documentation Site", 
          status: "active", 
          organization_id: "1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: "3", 
          name: "Analytics Dashboard", 
          status: "completed", 
          organization_id: "1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProject.name.trim()) {
      setError('Project name is required');
      return;
    }
    
    try {
      setCreating(true);
      setError(null);
      
      // Create the project via the Orchestrator
      const projectData = await window.convoy.createProject({
        name: newProject.name,
        description: newProject.description,
        status: 'active'
      });
      
      // Add the new project to the list
      setProjects(prev => [projectData, ...prev]);
      
      // Reset form
      setNewProject({ name: '', description: '' });
      setShowNewProjectForm(false);
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Helper function to calculate task progress
  const getTaskProgress = (projectId: string) => {
    // This would be replaced with actual data in a real implementation
    const mockData: Record<string, { total: number, completed: number }> = {
      "1": { total: 8, completed: 3 },
      "2": { total: 5, completed: 0 },
      "3": { total: 12, completed: 12 }
    };
    
    return mockData[projectId] || { total: 0, completed: 0 };
  };

  // Helper function to get status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active':
        return 'text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      case 'completed':
        return 'text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'archived':
        return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800';
    }
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
        <div className="mt-4 md:mt-0">
          <button
            type="button"
            onClick={() => setShowNewProjectForm(!showNewProjectForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showNewProjectForm ? 'Cancel' : 'New Project'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* New Project Form */}
      {showNewProjectForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create New Project</h3>
          <form onSubmit={handleCreateProject}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description:
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter project description"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Project Cards */}
      {!loading && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            // Get task progress info
            const progress = getTaskProgress(project.id);
            const progressPercentage = progress.total > 0 
              ? Math.round((progress.completed / progress.total) * 100) 
              : 0;
            
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
                  {project.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Progress</span>
                      <span>{progress.completed} of {progress.total} tasks</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full dark:bg-indigo-500" 
                        style={{ width: `${progressPercentage}%` }}
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
      )}

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No projects found. Create your first project to get started.
          </p>
          {!showNewProjectForm && (
            <button
              onClick={() => setShowNewProjectForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Project
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectListView;
