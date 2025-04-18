/**
 * DocumentServiceFallback - Fallback service for when Supabase is not available
 * This provides a mock implementation of the DocumentService interface using local data
 */
import { Document } from './DocumentService';

// In-memory storage for documents
const DOCUMENTS: Record<string, Document> = {
  // Root document
  '': {
    title: 'Knowledge Base',
    content: `# Convoy Memory Bank
    
Welcome to the Convoy Memory Bank. This is your central repository for all documentation related to the project.

## Contents

- **Workspace**: Workflows, activities, and best practices
- **Projects**: Roadmaps, statuses, and technical specifications
- **Cycles**: Planned and ongoing development cycles
- **Issues**: Current and resolved project issues`,
    path: ''
  },
  
  // Workspace documents
  'workspace/metadata': {
    title: 'Workspace Metadata',
    content: `# Workspace: Convoy

## Basic Information
- **Name**: Convoy
- **Description**: AI-assisted development platform designed to help teams build better software through enhanced human-AI collaboration
- **Created Date**: April 17, 2025
- **Last Updated**: April 17, 2025

## Overview
Convoy is an AI agent-driven product development framework leveraging autonomous AI agents orchestrated through an opinionated process and deeply contextualized via a knowledge graph.`,
    path: 'workspace/metadata'
  },
  
  // Pattern documents
  'patterns/current/memory-bank-pattern': {
    title: 'Memory Bank Pattern',
    content: `# Memory Bank Pattern

This document describes the Memory Bank pattern used in the Convoy MVP project.

## Overview

The Memory Bank pattern is a core architectural approach for maintaining context between work sessions in AI-assisted workflows. It provides a structured approach to documenting and retrieving project context.

## Implementation

The Memory Bank is implemented as a hierarchical directory structure:

- Workspace: The top-level container for all project information
- Projects: Project-specific documentation and specifications
- Cycles: Time-boxed development iterations
- Issues: Individual tasks and their implementation details`,
    path: 'patterns/current/memory-bank-pattern'
  },

  'patterns/current/memory-bank-traversal': {
    title: 'Memory Bank Traversal',
    content: `# Memory Bank Traversal

This document describes how to navigate and traverse the Memory Bank structure in the Convoy system.

## Overview

The Memory Bank Traversal pattern defines how to efficiently access and navigate the hierarchical structure of the Memory Bank, ensuring that related context can be quickly discovered and utilized.

## Traversal Patterns

### Hierarchical Traversal
Starting from the root workspace, navigation follows the natural hierarchy:
- Workspace → Projects → Specific Project → Documents
- Workspace → Patterns → Specific Patterns

### Relational Traversal
Following relationships between entities:
- Project → Related Projects
- Document → Referenced Documents
- Component → Dependencies

## Implementation

The Memory Bank Traversal is implemented through:

1. **Navigation Components:** Sidebar, breadcrumbs, and internal links
2. **Search Functionality:** Full-text search across all documents
3. **Relationship Visualization:** Graph-based views of related context
4. **Contextual Recommendations:** AI-assisted suggestions for relevant documents

## Use Cases

- Finding related documentation for a specific task
- Discovering implementation patterns across projects
- Tracing dependencies between components
- Building comprehensive context for AI-assisted development`,
    path: 'patterns/current/memory-bank-traversal'
  },
  
  // Project documents
  'projects/current/architecture': {
    title: 'Architecture',
    content: `# Architecture

This document provides an overview of the current project architecture.

## System Overview

The Convoy system architecture follows a modular design with several key components:

- **Frontend**: React-based SPA with TypeScript
- **Data Management**: Local-first approach with WatermelonDB
- **Knowledge Management**: Documentation system with Markdown

## Key Components

### Dashboard

The dashboard serves as the main interface for users to interact with the system. It provides:

- Project overview and status
- Navigation to different sections
- Quick access to commonly used features`,
    path: 'projects/current/architecture'
  },
  
  'projects/current/dashboard-architecture': {
    title: 'Dashboard Architecture',
    content: `# Dashboard Architecture

This document describes the architecture of the Convoy dashboard component.

## Overview

The dashboard is the primary user interface for the Convoy system, providing a unified way to access all functionality.

## Components

- **Navigation**: Sidebar navigation with context-sensitive sections
- **Knowledge Base**: Documentation viewer with Markdown rendering
- **Content Area**: Dynamic content based on the current route
- **Header**: Consistent header with breadcrumbs and status indicators

## Technical Implementation

- React 18+ with function components and hooks
- TanStack Router for client-side routing
- Context providers for theme, fonts, and other global state
- shadcn/ui component library with Tailwind CSS`,
    path: 'projects/current/dashboard-architecture'
  },
  
  'projects/current/convoy-mvp-architecture': {
    title: 'Convoy MVP Architecture',
    content: `# Convoy MVP Architecture

This document describes the architecture of the Convoy MVP project.

## Overview

The Convoy MVP architecture consists of several key components:

- **Dashboard**: React-based web interface for interacting with the system
- **Knowledge Base**: Central repository for documentation and project context
- **Memory Bank**: System for maintaining project context between sessions
- **Offline Support**: Local database for working without an internet connection`,
    path: 'projects/current/convoy-mvp-architecture'
  },

  'projects/current/convoy-mvp': {
    title: 'Convoy MVP Project',
    content: `# Convoy MVP Project

This document provides an overview of the Convoy MVP project.

## Project Overview

The Convoy MVP (Minimum Viable Product) aims to demonstrate the core functionality of the Convoy platform, focused on AI-assisted development workflows with structured context.

## Key Features

- **Knowledge Graph**: Structured project context with entities and relationships
- **Documentation Viewer**: Access to project documentation and specifications
- **Workflow Support**: Tools for managing AI-assisted development workflows
- **Offline Capabilities**: Support for working without internet connectivity

## Technology Stack

- **Frontend**: React, TypeScript, Shadcn/UI components
- **Data Storage**: WatermelonDB for local data, Supabase for remote
- **Documentation**: Markdown with special components for rich formatting
- **Routing**: TanStack Router for type-safe routing

## Implementation Status

The MVP is currently under active development, with key components being implemented incrementally.`,
    path: 'projects/current/convoy-mvp'
  },
  
  'projects/documentation-viewer': {
    title: 'Documentation Viewer',
    content: `# Documentation Viewer

This document describes the documentation viewer component of Convoy. The documentation viewer is responsible for rendering Markdown content and providing a navigation sidebar.

## Key Features

- Markdown rendering with syntax highlighting
- Table of contents generation
- Sidebar navigation
- Search functionality
- Metadata display`,
    path: 'projects/documentation-viewer'
  },

  // Knowledge Base migration document
  'docs/knowledge-base-supabase': {
    title: 'Knowledge Base Supabase Implementation',
    content: `# Knowledge Base Supabase Implementation

This document outlines the migration of the Knowledge Base documentation from static TypeScript objects to a Supabase-backed solution.

## Overview

The Knowledge Base has been redesigned to use Supabase as the backend storage for documentation. This offers several advantages:

- **Improved Maintainability**: Content is now stored in a database instead of hardcoded in TypeScript files
- **Better Routing**: Resolves conflicts with TanStack Router
- **Scalable Solution**: Makes it easier to add, update, and manage documentation
- **Better Error Handling**: More robust handling of missing documents and path resolution
- **Caching**: Performance optimization through client-side caching`,
    path: 'docs/knowledge-base-supabase'
  }
};

// In-memory cache for documents
const documentCache = new Map<string, {
  document: Document;
  cachedAt: number;
}>();

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

/**
 * Load a document from the mock storage by path
 */
export async function loadDocument(path: string): Promise<Document> {
  // Normalize the path - remove leading/trailing slashes, remove knowledge-base prefix
  const normalizedPath = path
    .replace(/^\/+|\/+$/g, '')
    .replace(/^knowledge-base\/?/, '');
  
  // Check cache first for better performance
  const cachedEntry = documentCache.get(normalizedPath);
  if (cachedEntry && (Date.now() - cachedEntry.cachedAt) < CACHE_EXPIRATION_MS) {
    return cachedEntry.document;
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Check if we have content for this exact path
  if (normalizedPath in DOCUMENTS) {
    const document = DOCUMENTS[normalizedPath];
    
    // Cache the document
    documentCache.set(normalizedPath, {
      document,
      cachedAt: Date.now()
    });
    
    return document;
  }
  
  // Try fallback strategies if exact path not found
  return findBestMatchingDocument(normalizedPath);
}

/**
 * Find the best matching document for a given path
 */
async function findBestMatchingDocument(path: string): Promise<Document> {
  // Strategy 1: Try with .md extension
  if (!path.endsWith('.md')) {
    const pathWithExt = `${path}.md`;
    if (pathWithExt in DOCUMENTS) {
      return DOCUMENTS[pathWithExt];
    }
  }
  
  // Strategy 2: Try to match a parent path
  const pathParts = path.split('/');
  while (pathParts.length > 0) {
    pathParts.pop();
    const parentPath = pathParts.join('/');
    
    if (parentPath in DOCUMENTS) {
      return {
        ...DOCUMENTS[parentPath],
        path // Keep original path for consistency
      };
    }
  }
  
  // Fallback: Generate content for unknown path
  return generateDocument(path);
}

/**
 * Generate a document for an unknown path
 */
function generateDocument(path: string): Document {
  // Extract title from path
  const title = formatTitle(path);
  
  // Create breadcrumb text
  const breadcrumbs = path
    .split('/')
    .map(part => formatTitle(part))
    .join(' > ');
  
  // Create document sections
  const content = `# ${title}

## Path

${breadcrumbs}

## Overview

This document contains information about ${title.toLowerCase()}.

## Details

This page was automatically generated for the path: ${path}.

## Related Documents

${path
  .split('/')
  .map(part => `- ${formatTitle(part)}`)
  .join('\n')}

## Last Updated

${new Date().toLocaleDateString()}`;
  
  return {
    title,
    content,
    path
  };
}

/**
 * Format a path segment as a title
 */
function formatTitle(pathSegment: string): string {
  if (!pathSegment) return 'Home';
  
  return pathSegment
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get all documents - useful for creating the sidebar
 */
export async function getAllDocuments(): Promise<Document[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return Object.values(DOCUMENTS);
}

/**
 * Create a new document or update an existing one
 */
export async function saveDocument(document: Document): Promise<Document | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Normalize the path
  const normalizedPath = document.path
    .replace(/^\/+|\/+$/g, '')
    .replace(/^knowledge-base\/?/, '');
  
  // Update or add document
  DOCUMENTS[normalizedPath] = {
    ...document,
    path: normalizedPath
  };
  
  // Update cache
  documentCache.set(normalizedPath, {
    document: DOCUMENTS[normalizedPath],
    cachedAt: Date.now()
  });
  
  return DOCUMENTS[normalizedPath];
}

/**
 * Delete a document by path
 */
export async function deleteDocument(path: string): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Normalize the path
  const normalizedPath = path
    .replace(/^\/+|\/+$/g, '')
    .replace(/^knowledge-base\/?/, '');
  
  // Delete document if it exists
  if (normalizedPath in DOCUMENTS) {
    delete DOCUMENTS[normalizedPath];
    
    // Remove from cache
    documentCache.delete(normalizedPath);
    
    return true;
  }
  
  return false;
}

/**
 * Search for documents by keyword
 */
export async function searchDocuments(query: string): Promise<Document[]> {
  if (!query || query.trim() === '') {
    return [];
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const lowerQuery = query.toLowerCase();
  
  // Filter documents that contain the query in title or content
  return Object.values(DOCUMENTS).filter(doc => 
    doc.title.toLowerCase().includes(lowerQuery) || 
    doc.content.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Clear the document cache
 */
export function clearDocumentCache(): void {
  documentCache.clear();
}

/**
 * Singleton document service
 */
export const documentServiceFallback = {
  loadDocument,
  getAllDocuments,
  saveDocument,
  deleteDocument,
  searchDocuments,
  clearDocumentCache
};
