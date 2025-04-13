const { createClient } = require('@supabase/supabase-js');
const { AIPlanningModule } = require('./planning');
const { safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');

/**
 * Main Orchestrator class for the Convoy application
 * Manages state, database interactions, and coordination between UI, Cline, and the AI Planning Module
 */
class ConvoyOrchestrator {
  constructor() {
    this.supabase = null;
    this.planningModule = null;
    this.activeTask = null;
    this.workflowStage = null;
    this.config = {
      supabaseUrl: null,
      supabaseKey: null,
      llmApiKey: null
    };
  }

  /**
   * Initialize the orchestrator with configuration
   * This loads API keys from secure storage if available
   */
  async initialize() {
    try {
      // Load configuration (in production, this would use electron.safeStorage)
      await this.loadConfiguration();
      
      // Initialize Supabase client
      if (this.config.supabaseUrl && this.config.supabaseKey) {
        this.supabase = createClient(
          this.config.supabaseUrl,
          this.config.supabaseKey
        );
        console.log('Supabase client initialized');
      } else {
        console.log('Supabase client not initialized: missing credentials');
      }
      
      // Initialize AI Planning Module
      if (this.config.llmApiKey) {
        this.planningModule = new AIPlanningModule(
          this.supabase,
          this.config.llmApiKey
        );
        console.log('AI Planning Module initialized');
      } else {
        console.log('AI Planning Module not initialized: missing LLM API key');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize orchestrator:', error);
      return false;
    }
  }

  /**
   * Load configuration from secure storage
   * In a real implementation, this would use electron.safeStorage
   */
  async loadConfiguration() {
    // For demo purposes, we're loading from environment variables or a .env file
    // In production, we'd use secure storage
    this.config.supabaseUrl = process.env.SUPABASE_URL;
    this.config.supabaseKey = process.env.SUPABASE_ANON_KEY;
    this.config.llmApiKey = process.env.LLM_API_KEY;
  }

  /**
   * Save configuration to secure storage
   * In a real implementation, this would use electron.safeStorage
   */
  async saveConfiguration(config) {
    // Update config in memory
    this.config = { ...this.config, ...config };
    
    // In a real implementation, save to secure storage
    console.log('Configuration updated (would be saved to secure storage)');
    
    // Reinitialize with new config
    return this.initialize();
  }

  // #region Project Management Methods

  /**
   * Fetch all projects
   */
  async getProjects() {
    if (!this.supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await this.supabase
      .from('projects')
      .select('*');
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Create a new project
   */
  async createProject(projectData) {
    if (!this.supabase) throw new Error('Supabase client not initialized');
    
    // Ensure organization_id is set
    if (!projectData.organization_id) {
      projectData.organization_id = '00000000-0000-0000-0000-000000000001'; // Default org
    }
    
    const { data, error } = await this.supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Create default workflow for the project
    await this.createProjectWorkflow(data.id);
    
    return data;
  }
  
  /**
   * Create default workflow for a project based on the global template
   */
  async createProjectWorkflow(projectId) {
    if (!this.supabase) throw new Error('Supabase client not initialized');
    
    // First get the global workflow template
    const { data: templateWorkflow, error: templateError } = await this.supabase
      .from('workflows')
      .select('*')
      .is('project_id', null)
      .single();
    
    if (templateError) throw templateError;
    
    // Create project-specific workflow
    const { data: workflow, error: workflowError } = await this.supabase
      .from('workflows')
      .insert({
        name: templateWorkflow.name,
        description: templateWorkflow.description,
        project_id: projectId
      })
      .select()
      .single();
    
    if (workflowError) throw workflowError;
    
    // Get template stages
    const { data: templateStages, error: stagesError } = await this.supabase
      .from('workflow_stages')
      .select('*')
      .eq('workflow_id', templateWorkflow.id)
      .order('order_index', { ascending: true });
    
    if (stagesError) throw stagesError;
    
    // Create project-specific stages
    const stages = templateStages.map(stage => ({
      workflow_id: workflow.id,
      name: stage.name,
      order_index: stage.order_index,
      is_checkpoint: stage.is_checkpoint,
      checkpoint_artifact_type: stage.checkpoint_artifact_type
    }));
    
    const { data: newStages, error: newStagesError } = await this.supabase
      .from('workflow_stages')
      .insert(stages)
      .select();
    
    if (newStagesError) throw newStagesError;
    
    return { workflow, stages: newStages };
  }

  // #endregion
  
  // #region Task Management Methods
  
  /**
   * Fetch tasks for a project
   */
  async getTasks(projectId) {
    if (!this.supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Get a specific task by ID
   */
  async getTask(taskId) {
    if (!this.supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Update a task's status
   */
  async updateTaskStatus(taskId, status) {
    if (!this.supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await this.supabase
      .from('tasks')
      .update({ status, updated_at: new Date() })
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Log activity
    await this.logActivity({
      task_id: taskId,
      type: 'STATUS_CHANGED',
      content: `Task status changed to "${status}"`
    });
    
    return data;
  }
  
  // #endregion
  
  // #region Activity Feed Methods
  
  /**
   * Get activity feed for a task
   */
  async getActivityFeed(taskId) {
    if (!this.supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await this.supabase
      .from('activity_feed_items')
      .select('*')
      .eq('task_id', taskId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Log an activity in the feed
   */
  async logActivity(activityData) {
    if (!this.supabase) throw new Error('Supabase client not initialized');
    
    // Set agent_id if not provided (indicating a system-generated event)
    if (!activityData.user_id && !activityData.agent_id) {
      activityData.agent_id = 'system';
    }
    
    const { data, error } = await this.supabase
      .from('activity_feed_items')
      .insert(activityData)
      .select();
    
    if (error) throw error;
    return data;
  }
  
  // #endregion
  
  // #region AI Planning Methods
  
  /**
   * Generate a plan for a project
   */
  async planProject(projectId, description) {
    if (!this.planningModule) throw new Error('Planning module not initialized');
    
    try {
      // Get the project
      const { data: project, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      
      // Generate plan
      const tasks = await this.planningModule.generatePlan(
        project.name,
        description
      );
      
      // Save tasks to the database
      const savedTasks = await this.planningModule.saveTasks(projectId, tasks);
      
      // Log planning activity
      await this.logActivity({
        task_id: null, // No specific task
        agent_id: 'ai-planner',
        type: 'PROJECT_PLANNED',
        content: `Generated plan with ${savedTasks.length} tasks for project "${project.name}"`
      });
      
      return savedTasks;
    } catch (error) {
      console.error('Error in planProject:', error);
      throw error;
    }
  }
  
  // #endregion
  
  // #region Checkpoint Management Methods
  
  /**
   * Check if a task is at a checkpoint stage
   */
  async checkTaskCheckpoint(taskId) {
    if (!this.supabase) throw new Error('Supabase client not initialized');
    
    // Get the task
    const task = await this.getTask(taskId);
    
    // Get project workflow
    const { data: workflow, error: workflowError } = await this.supabase
      .from('workflows')
      .select('*')
      .eq('project_id', task.project_id)
      .single();
    
    if (workflowError) throw workflowError;
    
    // Get workflow stages
    const { data: stages, error: stagesError } = await this.supabase
      .from('workflow_stages')
      .select('*')
      .eq('workflow_id', workflow.id)
      .order('order_index', { ascending: true });
    
    if (stagesError) throw stagesError;
    
    // Find current stage based on task status
    // This is a simplification - in a real implementation, we'd have a more sophisticated
    // way to map task status to workflow stage
    const currentStageIndex = stages.findIndex(stage => 
      stage.name.toLowerCase() === task.status.toLowerCase()
    );
    
    if (currentStageIndex === -1) {
      return null; // Not in a recognized workflow stage
    }
    
    const currentStage = stages[currentStageIndex];
    
    // Check if this is a checkpoint
    if (currentStage.is_checkpoint) {
      return {
        stage: currentStage,
        nextStage: currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null
      };
    }
    
    return null; // Not at a checkpoint
  }
  
  /**
   * Generate a checkpoint summary
   */
  async generateCheckpointSummary(taskId, checkpointType) {
    if (!this.planningModule) throw new Error('Planning module not initialized');
    
    // Get task details
    const task = await this.getTask(taskId);
    
    // Get recent activity
    const activities = await this.getActivityFeed(taskId);
    
    // Generate summary based on checkpoint type
    const summary = await this.planningModule.generateCheckpointSummary(
      task,
      activities,
      checkpointType
    );
    
    // Log the summary as an activity
    const { data: activity, error } = await this.supabase
      .from('activity_feed_items')
      .insert({
        task_id: taskId,
        agent_id: 'ai-review',
        type: 'CHECKPOINT_SUMMARY',
        content: summary
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return activity;
  }
  
  /**
   * Process user feedback at a checkpoint
   */
  async processCheckpointFeedback(taskId, feedbackContent, approved) {
    if (!this.supabase) throw new Error('Supabase client not initialized');
    
    // Log the user feedback
    await this.logActivity({
      task_id: taskId,
      user_id: 'user', // Would be the actual user ID in production
      type: approved ? 'CHECKPOINT_APPROVED' : 'CHECKPOINT_REVISION_REQUESTED',
      content: feedbackContent
    });
    
    // If approved, progress to the next stage
    if (approved) {
      const checkpoint = await this.checkTaskCheckpoint(taskId);
      if (checkpoint && checkpoint.nextStage) {
        await this.updateTaskStatus(taskId, checkpoint.nextStage.name);
      }
    }
    
    return approved;
  }
  
  // #endregion
  
  // #region Cline Integration Methods
  
  /**
   * Initialize communication with Cline
   * This is a placeholder for now - will be implemented in Phase 3
   */
  async initializeCline() {
    console.log('Cline integration will be implemented in Phase 3');
    return true;
  }
  
  // #endregion
}

module.exports = { ConvoyOrchestrator };
