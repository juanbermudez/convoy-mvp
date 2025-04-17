import { database, workstreams } from '../models';
import { syncService } from '../services/SyncService';
import { Q } from '@nozbe/watermelondb';
import Workstream from '../models/Workstream';
import { Observable } from 'rxjs';

// Interface for workstream filters
export interface WorkstreamFilters {
  projectId?: string;
  status?: string;
  search?: string;
}

export class WorkstreamRepository {
  // Get all workstreams with optional filters
  async getWorkstreams(filters: WorkstreamFilters = {}) {
    try {
      // Trigger background sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      // Build query conditions
      const conditions = [Q.where('deleted_at', null)];
      
      // Add filter conditions
      if (filters.projectId) {
        conditions.push(Q.where('project_id', filters.projectId));
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
      return await workstreams.query(...conditions).fetch();
    } catch (error) {
      console.error('Error fetching workstreams:', error);
      throw error;
    }
  }
  
  // Get workstream by ID
  async getWorkstreamById(id: string) {
    try {
      const workstream = await workstreams.find(id);
      
      // If the workstream is deleted, act as if it doesn't exist
      if (workstream.deletedAt) {
        throw new Error(`Workstream ${id} not found`);
      }
      
      return workstream;
    } catch (error) {
      console.error(`Error fetching workstream ${id}:`, error);
      throw error;
    }
  }
  
  // Create a new workstream
  async createWorkstream(data: {
    projectId: string;
    name: string;
    description?: string;
    status?: string;
    progress?: number;
    ownerId?: string;
  }) {
    try {
      let newWorkstream;
      
      await database.write(async () => {
        newWorkstream = await workstreams.create(workstream => {
          workstream.name = data.name;
          workstream.description = data.description || '';
          workstream.status = data.status || 'active';
          workstream.progress = data.progress || 0;
          if (data.ownerId) workstream.ownerId = data.ownerId;
          
          // This is a field that comes from the relation decorator
          // but TypeScript doesn't recognize it directly
          // @ts-ignore
          workstream.project.id = data.projectId;
        });
      });
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return newWorkstream;
    } catch (error) {
      console.error('Error creating workstream:', error);
      throw error;
    }
  }
  
  // Update a workstream
  async updateWorkstream(id: string, data: {
    name?: string;
    description?: string;
    status?: string;
    progress?: number;
    ownerId?: string | null;
    projectId?: string;
  }) {
    try {
      const workstream = await this.getWorkstreamById(id);
      
      await database.write(async () => {
        await workstream.update(w => {
          if (data.name !== undefined) w.name = data.name;
          if (data.description !== undefined) w.description = data.description;
          if (data.status !== undefined) w.status = data.status;
          if (data.progress !== undefined) w.progress = data.progress;
          if (data.ownerId !== undefined) w.ownerId = data.ownerId;
          
          // Updating project relation requires special handling
          if (data.projectId !== undefined) {
            // @ts-ignore
            w.project.id = data.projectId;
          }
        });
      });
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return workstream;
    } catch (error) {
      console.error(`Error updating workstream ${id}:`, error);
      throw error;
    }
  }
  
  // Delete a workstream
  async deleteWorkstream(id: string) {
    try {
      const workstream = await this.getWorkstreamById(id);
      
      await database.write(async () => {
        // Soft delete by updating the deletedAt field
        await workstream.update(w => {
          w.deletedAt = new Date();
        });
      });
      
      // Trigger sync if online
      if (navigator.onLine) {
        syncService.sync().catch(console.error);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting workstream ${id}:`, error);
      throw error;
    }
  }
  
  // Observe all workstreams
  observeWorkstreams(filters: WorkstreamFilters = {}): Observable<Workstream[]> {
    // Build query conditions
    const conditions = [Q.where('deleted_at', null)];
    
    // Add filter conditions
    if (filters.projectId) {
      conditions.push(Q.where('project_id', filters.projectId));
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
    
    return workstreams.query(...conditions).observe();
  }
  
  // Observe a specific workstream
  observeWorkstream(id: string): Observable<Workstream> {
    return workstreams.findAndObserve(id);
  }
}

// Export singleton instance
export const workstreamRepository = new WorkstreamRepository();
