import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

/**
 * Workflow model for WatermelonDB
 * Represents a workflow definition with stages
 */
export default class Workflow extends Model {
  static table = 'workflows';

  @text('name') name;
  @text('description') description;
  @field('stages') stages;
  @date('created_at') createdAt;
  @date('updated_at') updatedAt;
  @text('remote_id') remoteId;

  /**
   * Parse the stages from JSON string to object
   */
  get stagesObject() {
    if (!this.stages) return { stages: [] };
    try {
      return JSON.parse(this.stages);
    } catch (error) {
      console.error('Error parsing workflow stages:', error);
      return { stages: [] };
    }
  }

  /**
   * Get all stages as an array
   */
  get stagesArray() {
    return this.stagesObject.stages || [];
  }

  /**
   * Get a stage by name
   * @param stageName Name of the stage to get
   */
  getStage(stageName) {
    return this.stagesArray.find(stage => stage.name === stageName);
  }

  /**
   * Check if a stage is a checkpoint
   * @param stageName Name of the stage to check
   */
  isCheckpoint(stageName) {
    const stage = this.getStage(stageName);
    return stage ? stage.is_checkpoint : false;
  }

  /**
   * Get the next stage after the given stage
   * @param currentStage Current stage name
   */
  getNextStage(currentStage) {
    const stages = this.stagesArray;
    const currentIndex = stages.findIndex(stage => stage.name === currentStage);
    
    if (currentIndex === -1 || currentIndex >= stages.length - 1) {
      return null;
    }
    
    return stages[currentIndex + 1];
  }

  /**
   * Convert the model to a plain object suitable for sync
   */
  toSyncableObject() {
    return {
      id: this.remoteId,
      name: this.name,
      description: this.description,
      stages: this.stagesObject,
      created_at: new Date(this.createdAt).toISOString(),
      updated_at: new Date(this.updatedAt).toISOString(),
    };
  }

  /**
   * Convert a Supabase workflow object to a WatermelonDB-compatible format
   * @param supabaseWorkflow Workflow object from Supabase
   */
  static fromSupabase(supabaseWorkflow) {
    return {
      name: supabaseWorkflow.name,
      description: supabaseWorkflow.description,
      stages: JSON.stringify(supabaseWorkflow.stages),
      created_at: new Date(supabaseWorkflow.created_at).getTime(),
      updated_at: new Date(supabaseWorkflow.updated_at).getTime(),
      remote_id: supabaseWorkflow.id,
    };
  }
}
