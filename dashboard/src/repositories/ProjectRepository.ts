import { database, projects } from '../models';
import { syncService } from '../services/SyncService';
import { Q } from '@nozbe/watermelondb';
import Project from '../models/Project';
import { Observable } from 'rxjs';

// Interface for project filters
export interface ProjectFilters {
  workspaceId?: string;
  status?: string;
  search?: string;
}

export class ProjectRepository {
  // Get all projects with optional filters
  async getProjects(filters: ProjectFilters = {}) {
    try {
      // Trigger background sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      // Build query conditions
      const conditions = [Q.where('deleted_at', null)];
      
      // Add filter conditions
      if (filters.workspaceId) {
        conditions.push(Q.where('workspace_id', filters.workspaceId));
      }
      
      if (filters.status) {
        conditions.push(Q.where('status', filters.status));
      }
      
      if (filters.search) {
        const search = filters.search.toLowerCase();
        conditions.push(
          Q.or(
            Q.where('name', Q.like(`%${search}%`)),
            Q.where('description', Q.like(`%${search}%`))
          )
        );
      }
      
      // Return data from local database with filters
      return await projects.query(...conditions).fetch();
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }
  
  // Get project by ID
  async getProjectById(id: string) {
    try {
      const project = await projects.find(id);
      
      // If the project is deleted, act as if it doesn't exist
      if (project.deletedAt) {
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
  }) {
    try {
      let newProject;
      
      await database.write(async () => {
        newProject = await projects.create(project => {
          project.name = data.name;
          project.description = data.description || '';
          project.status = data.status || 'active';
          if (data.targetDate) project.targetDate = data.targetDate;
          if (data.ownerId) project.ownerId = data.ownerId;
          
          // This is a field that comes from the relation decorator
          // but TypeScript doesn't recognize it directly
          // @ts-ignore
          project.workspace.id = data.workspaceId;
        });
      });
      
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
  }) {
    try {
      const project = await this.getProjectById(id);
      
      await database.write(async () => {
        await project.update(p => {
          if (data.name !== undefined) p.name = data.name;
          if (data.description !== undefined) p.description = data.description;
          if (data.status !== undefined) p.status = data.status;
          if (data.targetDate !== undefined) p.targetDate = data.targetDate;
          if (data.ownerId !== undefined) p.ownerId = data.ownerId;
          
          // Updating workspace relation requires special handling
          if (data.workspaceId !== undefined) {
            // @ts-ignore
            p.workspace.id = data.workspaceId;
          }
        });
      });
      
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
  async deleteProject(id: string) {
    try {
      const project = await this.getProjectById(id);
      
      await database.write(async () => {
        // Soft delete by updating the deletedAt field
        await project.update(p => {
          p.deletedAt = new Date();
        });
      });
      
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
  
  // Observe all projects
  observeProjects(filters: ProjectFilters = {}): Observable<Project[]> {
    // Build query conditions
    const conditions = [Q.where('deleted_at', null)];
    
    // Add filter conditions
    if (filters.workspaceId) {
      conditions.push(Q.where('workspace_id', filters.workspaceId));
    }
    
    if (filters.status) {
      conditions.push(Q.where('status', filters.status));
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      conditions.push(
        Q.or(
          Q.where('name', Q.like(`%${search}%`)),
          Q.where('description', Q.like(`%${search}%`))
        )
      );
    }
    
    return projects.query(...conditions).observe();
  }
  
  // Observe a specific project
  observeProject(id: string): Observable<Project> {
    return projects.findAndObserve(id);
  }
}

// Export singleton instance
export const projectRepository = new ProjectRepository();
