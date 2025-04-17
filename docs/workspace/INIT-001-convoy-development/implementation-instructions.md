# Offline-First Data Integration Implementation

This document provides instructions for setting up and testing the offline-first data integration in the Convoy MVP application.

## Setup Instructions

Follow these steps to set up the offline-first data integration:

### 1. Install Dependencies

Install the required packages by running the following script:

```bash
cd /Users/juanbermudez/Documents/Work/convoy-mvp/dashboard
./install-offline-dependencies.sh
```

This will install:
- WatermelonDB for local database storage
- Supabase client for backend communication
- Other utility packages (uuid, date-fns, rxjs)

### 2. Set Up Environment Variables

Ensure that your `.env` file in the dashboard directory contains the following:

```
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Project Information
VITE_PROJECT_ID=your_project_id
VITE_PROJECT_NAME=Convoy-MVP
VITE_ORGANIZATION=Your_Organization
```

Replace the placeholders with your actual Supabase credentials.

### 3. Apply Database Migrations

Run the following commands to apply the schema updates to Supabase:

```bash
cd /Users/juanbermudez/Documents/Work/convoy-mvp
supabase db reset
```

Or to apply just the specific migration:

```bash
cd /Users/juanbermudez/Documents/Work/convoy-mvp
supabase db push -w supabase/migrations/TASK-002/20250414_offline_support.sql
```

### 4. Start the Development Server

Run the development server:

```bash
cd /Users/juanbermudez/Documents/Work/convoy-mvp/dashboard
pnpm dev
```

## Testing Instructions

### Testing Online Mode

1. Open the application in your browser
2. Verify that the SyncStatus indicator shows "Online" status
3. Create a new Project or Task
4. Verify that the data is saved to both WatermelonDB and Supabase
5. Refresh the page and confirm that the data persists

### Testing Offline Mode

1. Disconnect your computer from the internet (turn off Wi-Fi or use DevTools Network tab to simulate offline)
2. Verify that the SyncStatus indicator changes to "Offline" mode
3. Create a new Project or Task while offline
4. Verify that the data is saved locally and displayed in the UI
5. Reconnect to the internet
6. Observe that a sync is automatically triggered and the sync status updates
7. Verify in Supabase that the data was synchronized

### Testing Sync Functionality

1. Ensure you're online
2. Click the "Sync" button in the SyncStatus component
3. Verify that the sync is performed and the "Last synced" time updates
4. Make changes in Supabase directly (using the Dashboard)
5. Click the "Sync" button in the app
6. Verify that the changes from Supabase appear in the app

### Testing Offline-First Navigation

1. Browse through the application (view Projects, Tasks, etc.)
2. Disconnect from the internet
3. Continue navigating through the application
4. Verify that all previously loaded data is still accessible and interactive

## Troubleshooting

### Database Initialization Errors

If you encounter errors during database initialization:

1. Check the browser console for specific error messages
2. Verify that all required packages are installed
3. Ensure that your environment variables are correctly set
4. Clear browser storage (IndexedDB) and try again

### Sync Errors

If synchronization fails:

1. Check the browser console for error details
2. Verify that your Supabase credentials are correct
3. Ensure that the Supabase instance is running and accessible
4. Check for any networking issues or CORS problems

### Data Not Appearing

If data doesn't appear after creation or sync:

1. Check if there are any filters active that might hide the data
2. Verify the data exists in the browser's IndexedDB storage
3. Check if the data was successfully saved to Supabase
4. Try manually triggering a sync using the Sync button

## Architecture Overview

The implementation follows these key architectural patterns:

1. **Models**: WatermelonDB models define the data structure
2. **Repositories**: Data access layer for CRUD operations
3. **Hooks**: React hooks for component data access
4. **Sync Service**: Handles data synchronization between local and remote
5. **UI Components**: Display status and provide sync controls

## Next Steps

After verifying that the offline-first functionality works correctly, you can enhance the implementation with:

1. Authentication integration
2. More sophisticated conflict resolution
3. Background sync with service workers
4. Enhanced error handling and recovery
5. Performance optimizations for large datasets
