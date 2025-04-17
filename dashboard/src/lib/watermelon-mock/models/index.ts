// Export all models
import WorkspaceModel from './workspace';
import ProjectModel from './project';

export { 
  WorkspaceModel as Workspace,
  ProjectModel as Project
};

export default {
  Workspace: WorkspaceModel,
  Project: ProjectModel
};
