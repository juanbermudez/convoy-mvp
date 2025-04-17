import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import WatermelonSupabaseTest from '@/lib/watermelon/test/WatermelonSupabaseTest';
import DatabaseProvider from '@/lib/watermelon/providers/DatabaseProvider';

export const Route = createFileRoute('/tests/watermelon-supabase')({  
  component: () => (
    // Render the DatabaseProvider with error boundaries
    <ErrorBoundary 
      fallback={
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', borderRadius: '6px', margin: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Database Error</h2>
          <p>There was an error initializing the database. Please check the console for details.</p>
        </div>
      }
    >
      <DatabaseProvider>
        <WatermelonSupabaseTest />
      </DatabaseProvider>
    </ErrorBoundary>
  ),
});

// Proper React error boundary component 
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.error("Caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
