export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Database schema type definition
 * Generated from Supabase schema
 */
export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          overview: string | null;
          tech_stack: Json | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          overview?: string | null;
          tech_stack?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          overview?: string | null;
          tech_stack?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      milestones: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string | null;
          requirements: string | null;
          status: string;
          target_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          description?: string | null;
          requirements?: string | null;
          status?: string;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          description?: string | null;
          requirements?: string | null;
          status?: string;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          milestone_id: string;
          parent_task_id: string | null;
          title: string;
          description: string | null;
          current_stage: string;
          status: string;
          created_at: string;
          updated_at: string;
          completion_date: string | null;
        };
        Insert: {
          id?: string;
          milestone_id: string;
          parent_task_id?: string | null;
          title: string;
          description?: string | null;
          current_stage?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          completion_date?: string | null;
        };
        Update: {
          id?: string;
          milestone_id?: string;
          parent_task_id?: string | null;
          title?: string;
          description?: string | null;
          current_stage?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          completion_date?: string | null;
        };
      };
      task_dependencies: {
        Row: {
          id: string;
          task_id: string;
          depends_on_task_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          depends_on_task_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          depends_on_task_id?: string;
          created_at?: string;
        };
      };
      activity_feed: {
        Row: {
          id: string;
          task_id: string;
          actor_id: string | null;
          activity_type: string;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          actor_id?: string | null;
          activity_type: string;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          actor_id?: string | null;
          activity_type?: string;
          details?: Json | null;
          created_at?: string;
        };
      };
      workflows: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          stages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          stages: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          stages?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      patterns: {
        Row: {
          id: string;
          workspace_id: string | null;
          project_id: string | null;
          name: string;
          description: string | null;
          pattern_type: string;
          content: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id?: string | null;
          project_id?: string | null;
          name: string;
          description?: string | null;
          pattern_type: string;
          content: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string | null;
          project_id?: string | null;
          name?: string;
          description?: string | null;
          pattern_type?: string;
          content?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      best_practices: {
        Row: {
          id: string;
          workspace_id: string | null;
          project_id: string | null;
          name: string;
          description: string | null;
          category: string;
          content: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id?: string | null;
          project_id?: string | null;
          name: string;
          description?: string | null;
          category: string;
          content: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string | null;
          project_id?: string | null;
          name?: string;
          description?: string | null;
          category?: string;
          content?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
