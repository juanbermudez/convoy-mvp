import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables would typically be defined in a .env file
// and accessed via import.meta.env or process.env
// For this implementation, we'll use placeholder values that should be replaced in a real deployment

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

/**
 * Supabase client instance for interacting with the Convoy database
 * This client is used for all database operations and context retrieval
 */
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Check if the Supabase connection is valid
 * @returns {Promise<boolean>} True if connection is valid, false otherwise
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('workspaces').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};

export default supabase;
