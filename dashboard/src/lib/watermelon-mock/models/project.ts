// Mock Project model for WatermelonDB

export default class ProjectModel {
  static table = 'projects';
  
  // Define schema fields
  id: string = '';
  workspaceId: string = '';
  name: string = '';
  description: string = '';
  overview: string = '';
  techStack: string = '[]';
  status: string = 'active';
  createdAt: number = 0;
  updatedAt: number = 0;
  remoteId: string = '';
  
  // Mock methods
  update(callback: (model: ProjectModel) => void): Promise<ProjectModel> {
    callback(this);
    return Promise.resolve(this);
  }
  
  markAsDeleted(): Promise<void> {
    return Promise.resolve();
  }
  
  // Mock relationships
  workspace() {
    return {
      fetch: () => Promise.resolve(null)
    };
  }
  
  milestones() {
    return {
      fetch: () => Promise.resolve([])
    };
  }
}
