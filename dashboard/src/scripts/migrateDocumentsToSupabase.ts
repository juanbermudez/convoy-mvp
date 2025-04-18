/**
 * Migration script to extract static document content and migrate it to Supabase
 * 
 * This script should be run once to populate the Supabase documentation table
 * with the existing static content from DocumentService.ts and StaticKnowledgeBase
 */
import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Static document map from DocumentService.ts
const DOCUMENT_MAP: Record<string, string> = {
  // Root document
  '': `# Convoy Memory Bank
  
Welcome to the Convoy Memory Bank. This is your central repository for all documentation related to the project.

## Contents

- **Workspace**: Workflows, activities, and best practices
- **Projects**: Roadmaps, statuses, and technical specifications
- **Cycles**: Planned and ongoing development cycles
- **Issues**: Current and resolved project issues`,

  // Workspace documents
  'workspace/metadata': `# Workspace: Convoy

## Basic Information
- **Name**: Convoy
- **Description**: AI-assisted development platform designed to help teams build better software through enhanced human-AI collaboration
- **Created Date**: April 17, 2025
- **Last Updated**: April 17, 2025

## Overview
Convoy is an AI agent-driven product development framework leveraging autonomous AI agents orchestrated through an opinionated process and deeply contextualized via a knowledge graph. The system aims to shift software creation beyond current AI-assisted coding paradigms towards a future where agents drive the development lifecycle under human oversight.

## Key Principles
- **Opinionated Process**: Specific, optimized workflows for development
- **Knowledge Graph Context**: Deep, structured context for agent decision-making
- **Human Oversight**: Clear human checkpoints and feedback mechanisms
- **Quality Focus**: Balance between speed and craftsmanship
- **Consistent Structure**: Standardized approach to documentation and context`,

  // Workspace workflow documents
  'workspace/workflows/integrated-workflow': `# Integrated Workflow

This document describes the integrated workflow for Convoy development.

## Overview

The integrated workflow combines multiple specialized workflows to create a cohesive development process that spans from planning to deployment.

## Workflow Components

### Planning Phase
- Requirements gathering
- Task breakdown
- Prioritization

### Development Phase
- Feature implementation
- Code reviews
- Testing

### Documentation Phase
- Technical documentation
- User guides
- API references

### Deployment Phase
- Staging deployment
- Production release
- Monitoring

## Integration Points

The workflows integrate at specific checkpoints:

1. **Planning → Development**: Tasks are assigned and scheduled
2. **Development → Documentation**: Features are documented as they're implemented
3. **Documentation → Deployment**: Documentation is published with releases
4. **Deployment → Planning**: Feedback from releases informs future planning

## Tools and Resources

- Project management: GitHub Projects
- Version control: GitHub
- Documentation: Markdown files in the repository
- CI/CD: GitHub Actions`,

  // Pattern documents
  'patterns/current/memory-bank-pattern': `# Memory Bank Pattern

This document describes the Memory Bank pattern used in the Convoy MVP project.

## Overview

The Memory Bank pattern is a core architectural approach for maintaining context between work sessions in AI-assisted workflows. It provides a structured approach to documenting and retrieving project context.

## Implementation

The Memory Bank is implemented as a hierarchical directory structure:

- Workspace: The top-level container for all project information
- Projects: Project-specific documentation and specifications
- Cycles: Time-boxed development iterations
- Issues: Individual tasks and their implementation details`,

  'patterns/current/memory-bank-traversal': `# Memory Bank Traversal

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

  // Project documents
  'projects/current/architecture': `# Architecture

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

  'projects/current/convoy-mvp-architecture': `# Convoy MVP Architecture

This document describes the architecture of the Convoy MVP project.

## Overview

The Convoy MVP architecture consists of several key components:

- **Dashboard**: React-based web interface for interacting with the system
- **Knowledge Base**: Central repository for documentation and project context
- **Memory Bank**: System for maintaining project context between sessions
- **Offline Support**: Local database for working without an internet connection`,

  'projects/current/convoy-mvp': `# Convoy MVP Project

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

  'projects/documentation-viewer': `# Documentation Viewer

This document describes the documentation viewer component of Convoy. The documentation viewer is responsible for rendering Markdown content and providing a navigation sidebar.

## Key Features

- Markdown rendering with syntax highlighting
- Table of contents generation
- Sidebar navigation
- Search functionality
- Metadata display`
};

// Additional documents from StaticKnowledgeBase/index.tsx
const ADDITIONAL_DOCUMENTS: Record<string, { title: string; content: string }> = {
  // Root document is already in DOCUMENT_MAP

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
Convoy is an AI agent-driven product development framework leveraging autonomous AI agents orchestrated through an opinionated process and deeply contextualized via a knowledge graph.`
  },
  
  // Pattern documents already in DOCUMENT_MAP

  // Project documents
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
- shadcn/ui component library with Tailwind CSS`
  }
};

/**
 * Extract title from markdown content
 */
function extractTitle(content: string): string {
  const titleMatch = content.match(/^# (.+)$/m);
  return titleMatch ? titleMatch[1] : 'Untitled Document';
}

/**
 * Combine and deduplicate documents from both sources
 */
async function migrateDocuments() {
  try {
    console.log('Starting document migration to Supabase...');
    
    // Combined documents
    const allDocuments: Array<{
      path: string;
      title: string;
      content: string;
    }> = [];
    
    // Process documents from DocumentService
    Object.entries(DOCUMENT_MAP).forEach(([path, content]) => {
      allDocuments.push({
        path,
        title: extractTitle(content),
        content
      });
    });
    
    // Process additional documents from StaticKnowledgeBase
    Object.entries(ADDITIONAL_DOCUMENTS).forEach(([path, { title, content }]) => {
      // Check if this path already exists
      const existingIndex = allDocuments.findIndex(doc => doc.path === path);
      
      if (existingIndex === -1) {
        // Add new document
        allDocuments.push({ path, title, content });
      } else {
        // Skip if already added from DocumentService
        console.log(`Skipping duplicate document: ${path}`);
      }
    });
    
    console.log(`Found ${allDocuments.length} documents to migrate.`);
    
    // Insert documents into Supabase
    for (const doc of allDocuments) {
      console.log(`Migrating document: ${doc.path}`);
      
      const { data, error } = await supabase
        .from('documentation')
        .insert({
          path: doc.path,
          title: doc.title,
          content: doc.content,
          last_updated: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error(`Error inserting document ${doc.path}:`, error);
      } else {
        console.log(`Successfully migrated document: ${doc.path}`);
      }
    }
    
    console.log('Document migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateDocuments();
