import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import SupabaseConnectionTest from '@/components/tests/SupabaseConnectionTest';
import MemoryBankTest from '@/components/tests/MemoryBankTest';

// Define a route for testing Supabase integration
export const Route = createFileRoute('/tests/supabase')({
  component: SupabaseTestPage,
});

// Component for Supabase test page
function SupabaseTestPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Supabase Integration Tests</h1>
        <p className="text-gray-500">
          Use these test components to verify that the Supabase integration is working correctly
        </p>
      </div>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          <SupabaseConnectionTest />
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Memory Bank Test</h2>
          <MemoryBankTest />
        </section>
      </div>
    </div>
  );
}
