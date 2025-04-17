# Offline Support Schema Migration

This migration adds the necessary database schema changes to support offline-first functionality with synchronization between Supabase and WatermelonDB.

## Changes

1. **Soft Delete Support**
   - Added `deleted_at` columns to all main tables
   - Created indexes for efficient filtering of non-deleted records

2. **Synchronization Metadata**
   - Added `last_modified_by` for tracking which client made changes
   - Added `client_version` for conflict resolution

3. **Sync History Table**
   - Created `sync_history` table for tracking synchronization operations
   - Added indexes for efficient querying

4. **Updated Triggers**
   - Replaced existing update triggers with enhanced versions that track metadata
   - Implemented automatic version incrementation

5. **Modified Functions**
   - Updated existing functions to handle soft-deleted records
   - Added examples for key data access patterns

## Applying the Migration

To apply this migration:

```bash
cd /Users/juanbermudez/Documents/Work/convoy-mvp
supabase db reset
```

Or use the Supabase CLI to apply just this migration:

```bash
cd /Users/juanbermudez/Documents/Work/convoy-mvp
supabase db push -w supabase/migrations/TASK-002/20250414_offline_support.sql
```

## Rolling Back

If you need to roll back these changes:

```bash
cd /Users/juanbermudez/Documents/Work/convoy-mvp
supabase db push -w supabase/migrations/TASK-002/20250414_offline_support_rollback.sql
```

## Testing

After applying the migration, you can test the schema changes by:

1. Verifying the new columns exist:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'tasks';
   ```

2. Testing soft delete:
   ```sql
   -- Soft delete a task
   UPDATE tasks SET deleted_at = NOW() WHERE id = '[TASK_ID]';
   
   -- Verify it doesn't show up in regular queries
   SELECT * FROM get_tasks_for_project('[PROJECT_ID]');
   ```

3. Testing metadata updates:
   ```sql
   -- Update a workspace
   UPDATE workspaces 
   SET name = 'Updated Name', last_modified_by = 'test-client' 
   WHERE id = '[WORKSPACE_ID]';
   
   -- Verify metadata was updated
   SELECT name, client_version, last_modified_by, updated_at 
   FROM workspaces 
   WHERE id = '[WORKSPACE_ID]';
   ```
