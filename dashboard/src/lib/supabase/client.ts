import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseKey);
};

// Helper function to check connection to Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Perform a simple query to check if we can connect
    const { error } = await supabase
      .from('workspaces')
      .select('id')
      .limit(1);
    
    // If there's no error, connection is successful
    return !error;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
}

// Helper function to get current user information
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper function to get session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
