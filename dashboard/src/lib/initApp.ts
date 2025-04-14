import { checkSupabaseConnection } from './supabase/client';
import { initDatabase, sync } from './watermelon';

/**
 * Initialize the application
 * This function should be called when the application starts
 */
export async function initializeApp(): Promise<boolean> {
  try {
    console.log('Initializing application...');
    
    // Check Supabase connection
    const supabaseConnected = await checkSupabaseConnection();
    console.log('Supabase connection:', supabaseConnected ? 'OK' : 'Failed');
    
    // Initialize WatermelonDB
    const dbInitialized = await initDatabase();
    console.log('WatermelonDB initialization:', dbInitialized ? 'OK' : 'Failed');
    
    // Try to synchronize if Supabase is connected
    if (supabaseConnected) {
      console.log('Attempting initial synchronization...');
      await sync();
    }
    
    console.log('Application initialization complete');
    return true;
  } catch (error) {
    console.error('Error initializing application:', error);
    return false;
  }
}
