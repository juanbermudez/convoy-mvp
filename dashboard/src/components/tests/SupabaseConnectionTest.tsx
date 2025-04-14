import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

import { supabase, checkSupabaseConnection } from '@/lib/supabase/client';
import { getWorkspaces } from '@/lib/supabase/contextService';

/**
 * Component for testing Supabase connection and basic operations
 * This is used during development to verify that the Supabase integration is working correctly
 */
export default function SupabaseConnectionTest() {
  const [connectionState, setConnectionState] = useState<'checking' | 'success' | 'failure'>('checking');
  const [workspaces, setWorkspaces] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Test connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  // Test Supabase connection
  const testConnection = async () => {
    setConnectionState('checking');
    setError(null);
    
    try {
      const isConnected = await checkSupabaseConnection();
      setConnectionState(isConnected ? 'success' : 'failure');
      
      if (!isConnected) {
        setError('Failed to connect to Supabase database. Check your configuration.');
      }
    } catch (err) {
      setConnectionState('failure');
      setError('Error checking connection: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Fetch workspaces from the database
  const fetchWorkspaces = async () => {
    setError(null);
    try {
      const data = await getWorkspaces();
      setWorkspaces(data);
      
      if (!data) {
        setError('No workspaces found or error fetching workspaces.');
      }
    } catch (err) {
      setError('Error fetching workspaces: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Run a test query against the database
  const runTestQuery = async () => {
    setError(null);
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      console.log('Test query result:', data);
      alert('Test query successful. Check console for results.');
    } catch (err) {
      setError('Error running test query: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>
          Test the connection to Supabase and perform basic operations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
          <div>
            <h3 className="font-medium">Connection Status</h3>
            <p className="text-sm text-gray-500">
              {connectionState === 'checking' ? 'Checking connection...' : 
               connectionState === 'success' ? 'Connected to Supabase' : 
               'Connection failed'}
            </p>
          </div>
          <div>
            {connectionState === 'checking' ? (
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            ) : connectionState === 'success' ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
        </div>
        
        {/* Workspaces */}
        {workspaces && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Workspaces</h3>
            <div className="border rounded-md divide-y">
              {workspaces.length > 0 ? (
                workspaces.map((workspace) => (
                  <div key={workspace.id} className="p-3">
                    <div className="font-medium">{workspace.name}</div>
                    <div className="text-sm text-gray-500">{workspace.description || 'No description'}</div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-500">No workspaces found</div>
              )}
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="flex justify-between p-4">
        <Button onClick={testConnection} variant="outline">
          Test Connection
        </Button>
        <Button onClick={fetchWorkspaces} variant="outline">
          Fetch Workspaces
        </Button>
        <Button onClick={runTestQuery} variant="default">
          Run Test Query
        </Button>
      </CardFooter>
    </Card>
  );
}
