---
title: Supabase Integration Overview
description: Overview of the Supabase integration for the Convoy knowledge graph
---

# Supabase Integration Overview

The Convoy system uses Supabase as its database backend, storing the entire knowledge graph structure that powers the Memory Bank pattern. This document provides an overview of the integration and how it works.

## Integration Components

The Supabase integration consists of several key components:

1. **Database Schema**: A PostgreSQL schema that defines the structure of the knowledge graph, including workspaces, projects, milestones, tasks, and supporting entities.

2. **Supabase Client**: A client configuration that connects to the Supabase project and provides access to the database.

3. **Context Service**: A set of functions that enable efficient retrieval and traversal of the knowledge graph for AI context.

4. **React Hooks**: Custom hooks that make it easy to access the Memory Bank from React components.

5. **Data Operations**: Utility functions for common data operations like creating, updating, and deleting entities.

## Key Features

The Supabase integration provides the following key features:

### Hierarchical Data Storage

The database schema is designed to store hierarchical data with proper relationships:

```
Workspace → Project → Milestone → Task → Subtask
```

This hierarchy allows for efficient traversal of the knowledge graph and provides context awareness for AI agents.

### Context Retrieval

The Context Service provides efficient retrieval of the complete context for a task, including:

- The task itself
- Its parent task (if applicable)
- Its subtasks (if any)
- The milestone it belongs to
- The project the milestone belongs to
- The workspace the project belongs to
- Recent activity history
- Relevant patterns and best practices

This comprehensive context enables AI agents to understand the full picture of what they're working on.

### Activity Tracking

The system tracks all activities related to tasks, including:

- Stage changes (e.g., PLAN → PLAN_REVIEW → IMPLEMENT)
- Task updates
- Dependency changes

This activity history provides a timeline of what has happened with a task and is essential for AI context awareness.

### Pattern and Best Practice Management

The system stores patterns and best practices that can be scoped at different levels:

- Global patterns/practices (applicable to all workspaces and projects)
- Workspace-specific patterns/practices
- Project-specific patterns/practices

These patterns and practices are included in the task context, providing guidance for AI agents.

## Integration Architecture

The integration follows this architecture:

```
┌───────────────┐     ┌─────────────┐     ┌──────────────┐
│               │     │             │     │              │
│ React UI      │────►│ React Hooks │────►│ Context      │
│ Components    │     │             │     │ Service      │
│               │     │             │     │              │
└───────────────┘     └─────────────┘     └──────────┬───┘
                                                     │
                                                     ▼
                                          ┌──────────────────┐
                                          │                  │
                                          │ Supabase Client  │
                                          │                  │
                                          └────────┬─────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │                  │
                                          │ Supabase Database│
                                          │                  │
                                          └──────────────────┘
```

This architecture provides a clean separation of concerns and makes it easy to use the knowledge graph in React components.

## Environment Configuration

The Supabase integration requires the following environment variables:

- `VITE_SUPABASE_URL`: The URL of your Supabase project
- `VITE_SUPABASE_ANON_KEY`: The anonymous key for your Supabase project

These should be configured in a `.env` file or through your hosting provider's environment variable system.

## Testing

The integration includes test components that allow you to verify that everything is working correctly:

- **Connection Test**: Tests the basic Supabase connection and performs simple operations
- **Memory Bank Test**: Tests the complete context retrieval functionality

These tests are accessible via the `/tests/supabase` route in the dashboard.

## Next Steps

For more detailed information about the Supabase integration, refer to the following documents:

- [Database Schema](./schema.md) - Detailed documentation of the database schema
- [Context Service](./context-service.md) - Documentation of the Context Service functions
- [Data Operations](./data-operations.md) - Documentation of common data operations
- [React Hooks](./hooks.md) - Documentation of React hooks for using the Memory Bank
