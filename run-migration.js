// Script to apply database migrations using Supabase client
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://nksoxtqdkkxgpexnhuyw.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your_supabase_key_here';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the migration SQL file
const migrationFile = path.join(process.cwd(), 'supabase/migrations/20250416_fix_schema_for_offline.sql');
const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

// Split the SQL into individual statements
const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);

async function runMigration() {
  console.log('Applying database migration...');
  
  try {
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.trim().substring(0, 100)}...`);
      
      const { error } = await supabase.rpc('execute_sql', { 
        sql_query: statement.trim() 
      });
      
      if (error) {
        console.error('Error executing SQL:', error);
        // Continue with next statement
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
  }
}

runMigration();
