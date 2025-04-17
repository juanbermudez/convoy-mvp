#!/bin/bash
# Script to apply the schema update for offline-first functionality

echo "Applying Convoy MVP schema updates for offline-first functionality..."
echo ""

# Navigate to the project directory
cd "$(dirname "$0")"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first."
    echo "Visit https://supabase.com/docs/guides/cli for installation instructions."
    exit 1
fi

# Apply the migration
echo "Applying database migration..."
supabase db reset --db-url "postgresql://postgres:postgres@localhost:54322/postgres" 

# Check if the migration was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "Database migration was successful!"
    echo ""
    echo "The following changes were applied:"
    echo "  - Added 'deleted_at' columns to all tables for soft deletion"
    echo "  - Added 'last_modified_by' and 'client_version' columns for sync"
    echo "  - Created 'sync_history' table for tracking synchronization"
    echo "  - Added indexes for better query performance"
    echo ""
    echo "You can now run the application with offline-first capability."
else
    echo ""
    echo "Error applying migration. Please check the error message above."
    exit 1
fi
