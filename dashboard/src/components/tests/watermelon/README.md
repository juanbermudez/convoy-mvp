# WatermelonDB Sync Testing

This directory contains a test component to verify the WatermelonDB sync functionality for the Convoy MVP.

## Overview

The test component allows you to:

1. Initialize the WatermelonDB database
2. Create and manage workspaces and projects in the local database
3. View data in both the local database and Supabase
4. Manually trigger synchronization between local and remote databases
5. Test offline functionality and sync when connection is restored

## How to Use

1. Navigate to `/tests/watermelon` in the application
2. The interface shows the connection status (online/offline) and database initialization status
3. Create workspaces and projects using the forms provided
4. View local database content in the "Local Database" tab
5. View remote database content in the "Remote Database" tab (when online)
6. Click "Trigger Sync" to manually synchronize between local and remote databases
7. You can test offline functionality by disconnecting from the internet and creating/modifying data locally
8. After reconnecting, trigger a sync to push local changes to the remote database

## Testing Synchronization

To properly test the sync functionality:

1. **Initial State**: Start with both databases in sync (trigger a sync if needed)
2. **Create Local Data**: Add workspaces and projects locally
3. **Verify Sync**: Trigger sync and check that local data appears in the remote database
4. **Create Remote Data**: If you have access to Supabase, add data directly there
5. **Pull Remote Data**: Trigger sync and verify that remote data appears locally
6. **Offline Mode**: Disconnect from the internet, make local changes
7. **Reconnect & Sync**: Reconnect and verify changes are pushed to the remote database

## Common Issues

- **Database Initialization Failure**: Verify Supabase connection in `.env` file
- **Sync Fails**: Check browser console for specific error messages
- **Remote Data Not Appearing**: Verify your Supabase permissions and schema match the expected structure
- **Inconsistent Data**: If sync appears to be working but data is inconsistent, check the mapping between local and remote IDs

## Testing Checklist

- [ ] Database initializes successfully
- [ ] Can create workspaces locally
- [ ] Can create projects locally
- [ ] Local workspaces sync to remote database
- [ ] Local projects sync to remote database
- [ ] Remote changes sync to local database
- [ ] Offline changes persist locally
- [ ] Offline changes sync when connection is restored
- [ ] Deleting items works and syncs correctly

## Next Steps

After confirming basic sync functionality, consider testing more complex scenarios:

1. Concurrent modifications (same entity modified locally and remotely)
2. Large data sets for performance testing
3. Sync during application startup and background sync
4. Error recovery and conflict resolution
