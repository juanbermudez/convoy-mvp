/**
 * WatermelonDB Database Provider
 * 
 * This component provides the WatermelonDB database to its children.
 */

import React, { useState, useEffect } from 'react';
import { DatabaseProvider as WatermelonProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { database, initDatabase } from '../database';
// Remove direct schema import as we're handling it in database.ts

interface DatabaseProviderProps {
  children: React.ReactNode;
}

/**
 * Component to initialize and provide the WatermelonDB database
 */
export default function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Initializing database...');
        
        // Initialize database with error handling
        const success = await initDatabase();
        
        if (success) {
          console.log('Database initialized successfully!');
          setInitialized(true);
        } else {
          throw new Error('Database initialization failed');
        }
      } catch (err) {
        console.error('Database initialization failed:', err);
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    initializeDatabase();
  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#ffebee', borderRadius: '4px', margin: '20px' }}>
        <h2>Database Initialization Error</h2>
        <p>{error}</p>
        <p>Please check the console for more details.</p>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Initializing Database...</h2>
        <p>Please wait while the database is being set up.</p>
      </div>
    );
  }

  return (
    <WatermelonProvider database={database}>
      {children}
    </WatermelonProvider>
  );
}
