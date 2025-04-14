import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// In the production app, these values would be provided securely by the orchestrator
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// This client is meant to be used in the renderer process
// For secure operations, requests should be proxied through the orchestrator
// in the main process using IPC communication
