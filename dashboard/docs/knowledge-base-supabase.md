# Knowledge Base Supabase Implementation

This document outlines the migration of the Knowledge Base documentation from static TypeScript objects to a Supabase-backed solution.

## Overview

The Knowledge Base has been redesigned to use Supabase as the backend storage for documentation. This offers several advantages:

- **Improved Maintainability**: Content is now stored in a database instead of hardcoded in TypeScript files
- **Better Routing**: Resolves conflicts with TanStack Router
- **Scalable Solution**: Makes it easier to add, update, and manage documentation
- **Better Error Handling**: More robust handling of missing documents and path resolution
- **Caching**: Performance optimization through client-side caching

## Database Schema

The implementation creates a `documentation` table in Supabase with the following schema:

```sql
CREATE TABLE IF NOT EXISTS documentation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for faster path-based lookups
CREATE INDEX IF NOT EXISTS idx_documentation_path ON documentation(path);

-- Trigger to automatically update last_updated timestamp
CREATE TRIGGER update_documentation_last_updated
BEFORE UPDATE ON documentation
FOR EACH ROW
EXECUTE FUNCTION update_documentation_last_updated();
```

## Migration Process

Follow these steps to migrate the existing static content to Supabase:

1. **Apply the database schema migration**:
   ```bash
   cd dashboard
   # Run the Supabase migration
   npx supabase migration up
   ```

2. **Run the migration script** to populate the Supabase table with existing documentation:
   ```bash
   cd dashboard
   # Ensure your Supabase environment variables are set
   export VITE_SUPABASE_URL="your-supabase-url"
   export VITE_SUPABASE_ANON_KEY="your-anon-key"
   
   # Run the migration script
   npx ts-node src/scripts/migrateDocumentsToSupabase.ts
   ```

## Architecture Changes

### New Components

- **DocumentService**: Updated to use Supabase for document storage and retrieval
- **DynamicSidebar**: New component that dynamically builds the sidebar from the documentation structure in Supabase

### Changes to Existing Files

1. `dashboard/src/services/DocumentService.ts`: Completely rewritten to use Supabase
2. `dashboard/src/features/knowledge-base/index.tsx`: Updated to use the new async document loading
3. `dashboard/src/features/knowledge-base/components/DynamicSidebar.tsx`: New component to replace static sidebar

## Using the New Documentation System

### Adding New Documents

Documents can now be added directly to Supabase using the `saveDocument` function:

```typescript
import { documentService } from '@/services/DocumentService';

// Add or update a document
await documentService.saveDocument({
  path: 'workspace/new-document',
  title: 'New Document',
  content: '# New Document\n\nThis is a new document.'
});
```

### Retrieving Documents

Documents can be retrieved using the `loadDocument` function:

```typescript
import { documentService } from '@/services/DocumentService';

// Load a document
const document = await documentService.loadDocument('workspace/new-document');
```

### Searching Documents

The service supports searching documents:

```typescript
import { documentService } from '@/services/DocumentService';

// Search for documents containing "workflow"
const results = await documentService.searchDocuments('workflow');
```

## Future Enhancements

1. **Admin UI**: Create an admin interface for managing documents
2. **Version Control**: Add versioning for documents
3. **Access Control**: Implement user-based access controls
4. **Offline Support**: Enhance offline capabilities with local caching
5. **Rich Media Support**: Add support for images and other media types in documents

## Troubleshooting

If you encounter issues with the Knowledge Base after migration:

1. Check your Supabase connection settings in the environment variables
2. Verify that the migration script ran successfully and documents were created
3. Clear document cache using `documentService.clearDocumentCache()`
4. Check the browser console for any error messages
