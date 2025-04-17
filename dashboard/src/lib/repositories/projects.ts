/**
 * Projects repository for handling project data access
 */

import { query, getById, add, update, softDelete, stores } from '../db/client';
import { syncService } from '../db/sync';
import { v4 as uuidv4 } from 'uuid';

// Project interface
export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  status: string;
  target_date?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  last_modified_by?: string;
  client_version?: number;
}

// Interface for project filters
export interface ProjectFilters {
  workspaceId?: string;
  status?: string;
  search?: string;
}

class ProjectRepository {
  // Get all projects with optional filters
  async getProjects(filters: ProjectFilters = {}): Promise<Project[]> {
    try {
      // Trigger background sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      // Build query filters
      const queryFilters: Record<string, any> = {};
      
      if (filters.workspaceId) {
        queryFilters.workspace_id = filters.workspaceId;
      }
      
      if (filters.status) {
        queryFilters.status = filters.status;
      }
      
      // Get projects from IndexedDB
      let projects = await query<Project>(stores.projects, queryFilters);
      
      // Handle search (client-side filtering)
      if (filters.search) {
        const search = filters.search.toLowerCase();
        projects = projects.filter(project => 
          project.name.toLowerCase().includes(search) || 
          (project.description || '').toLowerCase().includes(search)
        );
      }
      
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }
  
  // Get project by ID
  async getProjectById(id: string): Promise<Project> {
    try {
      const project = await getById<Project>(stores.projects, id);
      
      if (!project || project.deleted_at) {
        throw new Error(`Project ${id} not found`);
      }
      
      return project;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  }
  
  // Create a new project
  async createProject(data: {
    workspaceId: string;
    name: string;
    description?: string;
    status?: string;
    targetDate?: Date;
    ownerId?: string;
  }): Promise<Project> {
    try {
      const now = new Date().toISOString();
      const newProject: Project = {
        id: uuidv4(),
        workspace_id: data.workspaceId,
        name: data.name,
        description: data.description || '',
        status: data.status || 'active',
        target_date: data.targetDate?.toISOString(),
        owner_id: data.ownerId,
        created_at: now,
        updated_at: now,
        last_modified_by: syncService.getStatus().isOnline ? 'server' : 'local',
        client_version: 1
      };
      
      // Add to IndexedDB
      await add<Project>(stores.projects, newProject);
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }
  
  // Update a project
  async updateProject(id: string, data: {
    name?: string;
    description?: string;
    status?: string;
    targetDate?: Date | null;
    ownerId?: string | null;
    workspaceId?: string;
  }): Promise<Project> {
    try {
      // Get current project
      const project = await this.getProjectById(id);
      
      // Update fields
      if (data.name !== undefined) project.name = data.name;
      if (data.description !== undefined) project.description = data.description;
      if (data.status !== undefined) project.status = data.status;
      if (data.targetDate !== undefined) {
        project.target_date = data.targetDate ? data.targetDate.toISOString() : undefined;
      }
      if (data.ownerId !== undefined) project.owner_id = data.ownerId || undefined;
      if (data.workspaceId !== undefined) project.workspace_id = data.workspaceId;
      
      // Update metadata
      project.updated_at = new Date().toISOString();
      project.last_modified_by = syncService.getStatus().isOnline ? 'server' : 'local';
      project.client_version = (project.client_version || 0) + 1;
      
      // Update in IndexedDB
      await update<Project>(stores.projects, project);
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return project;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  }
  
  // Delete a project
  async deleteProject(id: string): Promise<boolean> {
    try {
      // Soft delete in IndexedDB
      await softDelete(stores.projects, id);
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }
  
  // Subscribe to changes (simplified version)
  observeProjects(callback: (projects: Project[]) => void, filters: ProjectFilters = {}) {
    // This is a simplified implementation
    // In a real app, we would use a proper observable pattern
    
    // Initial load
    this.getProjects(filters).then(callback).catch(console.error);
    
    // Poll for changes every 2 seconds
    const intervalId = setInterval(() => {
      this.getProjects(filters).then(callback).catch(console.error);
    }, 2000);
    
    // Return unsubscribe function
    return () => {
      clearInterval(intervalId);
    };
  }
  
  // Subscribe to a single project
  observeProject(callback: (project: Project | null) => void, id: string) {
    // This is a simplified implementation
    
    // Initial load
    this.getProjectById(id).then(callback).catch(error => {
      console.error(error);
      callback(null);
    });
    
    // Poll for changes every 2 seconds
    const intervalId = setInterval(() => {
      this.getProjectById(id).then(callback).catch(error => {
        console.error(error);
        callback(null);
      });
    }, 2000);
    
    // Return unsubscribe function
    return () => {
      clearInterval(intervalId);
    };
  }
}

// Export singleton instance
export const projectRepository = new ProjectRepository();
