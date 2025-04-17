# Supabase Setup

## Project Details

- **Project URL**: https://nksoxtqdkkxgpexnhuyw.supabase.co
- **Project ID**: nksoxtqdkkxgpexnhuyw  
- **Organization**: SVS

## Database Schema

The database schema includes the following core tables:

- **workspaces**: Defines the top-level organization container
- **projects**: Defines projects within workspaces
- **milestones**: Defines milestones within projects
- **tasks**: Defines tasks within milestones, can have parent-child relationships
- **task_dependencies**: Defines dependencies between tasks
- **activity_feed**: Tracks activities related to tasks
- **workflows**: Defines workflow stages and processes
- **patterns**: Stores reusable implementation patterns
- **best_practices**: Stores guidance for quality work

## Environment Configuration

The Supabase connection details are stored in the `.env` file at the project root:

```
VITE_SUPABASE_URL=https://nksoxtqdkkxgpexnhuyw.supabase.co
VITE_SUPABASE_ANON_KEY=[anon_key]
VITE_PROJECT_ID=nksoxtqdkkxgpexnhuyw
VITE_PROJECT_NAME=Convoy-MVP
VITE_ORGANIZATION=SVS
```

These variables are used in `dashboard/src/lib/supabase/client.ts` to initialize the Supabase client.

## Client Implementation

The Supabase client is implemented in `dashboard/src/lib/supabase/client.ts`. It uses the environment variables to connect to the Supabase project and provides a function to check the connection status.

## Migrations

Database schema migrations are stored in `dashboard/supabase/migrations/`:

- `20250414000000_initial_schema.sql`: Creates the database schema
- `20250414000001_seed_data.sql`: Adds initial seed data

## Next Steps

1. Implement authentication
2. Create models for each database table
3. Implement data fetching and mutation functions
4. Add role-based access control
