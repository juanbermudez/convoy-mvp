// Type definitions for Convoy MVP

// Organization
export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

// Project
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'completed';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

// Milestone
export interface Milestone {
  id: string;
  name: string;
  description?: string;
  due_date?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

// Task
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'planning' | 'development' | 'code review' | 'testing' | 'deployment' | 'completed';
  priority: 'high' | 'medium' | 'low';
  project_id: string;
  milestone_id?: string;
  assignee_id?: string;
  created_at: string;
  updated_at: string;
}

// Workflow
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  project_id?: string; // null for global template workflows
}

// Workflow Stage
export interface WorkflowStage {
  id: string;
  workflow_id: string;
  name: string;
  order_index: number;
  is_checkpoint: boolean;
  checkpoint_artifact_type?: 'PLAN_REVIEW' | 'CODE_REVIEW' | 'FUNCTIONALITY_REVIEW';
  created_at: string;
}

// Project Rule
export interface ProjectRule {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  rule_content: string; // JSON or structured content
  created_at: string;
  updated_at: string;
}

// Activity Feed Item
export interface ActivityFeedItem {
  id: string;
  task_id?: string;
  user_id?: string;
  agent_id?: string;
  timestamp: string;
  type: 'TASK_CREATED' | 'STATUS_CHANGED' | 'AI_COMMENT' | 'USER_COMMENT' | 
        'CODE_EDIT' | 'COMMAND_EXECUTED' | 'ERROR_LOG' | 'CHECKPOINT_SUMMARY' | 
        'CHECKPOINT_APPROVED' | 'CHECKPOINT_REVISION_REQUESTED' | 'PROJECT_PLANNED';
  content: string;
}

// Checkpoint information returned from checkTaskCheckpoint
export interface CheckpointInfo {
  stage: WorkflowStage;
  nextStage: WorkflowStage | null;
}

// Configuration interface
export interface ConvoyConfig {
  supabaseUrl: string | null;
  supabaseKey: string | null;
  llmApiKey: string | null;
}

// Global convoy API interface
export interface ConvoyAPI {
  // Configuration
  getConfig: () => Promise<ConvoyConfig>;
  saveConfig: (config: Partial<ConvoyConfig>) => Promise<boolean>;
  
  // Project Management
  getProjects: () => Promise<Project[]>;
  createProject: (projectData: Partial<Project>) => Promise<Project>;
  
  // Task Management
  getTasks: (projectId: string) => Promise<Task[]>;
  getTask: (taskId: string) => Promise<Task>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<Task>;
  
  // AI Planning
  planProject: (projectId: string, description: string) => Promise<Task[]>;
  
  // Activity Feed
  getActivityFeed: (taskId: string) => Promise<ActivityFeedItem[]>;
  logActivity: (activityData: Partial<ActivityFeedItem>) => Promise<ActivityFeedItem>;
  
  // Checkpoint Management
  checkTaskCheckpoint: (taskId: string) => Promise<CheckpointInfo | null>;
  generateCheckpointSummary: (taskId: string, checkpointType: string) => Promise<ActivityFeedItem>;
  processCheckpointFeedback: (taskId: string, feedbackContent: string, approved: boolean) => Promise<boolean>;
  
  // Cline Integration (placeholder for Phase 3)
  initializeCline: () => Promise<boolean>;
}

// Extend Window interface to include global convoy object
declare global {
  interface Window {
    convoy: ConvoyAPI;
  }
}
