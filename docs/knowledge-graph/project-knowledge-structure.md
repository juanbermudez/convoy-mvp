---
title: Project Knowledge Structure
description: How project information is structured in the Convoy Memory Bank
---

# Project Knowledge Structure

## Overview

This document outlines how project knowledge is structured within the Convoy Memory Bank. Project knowledge forms the foundation of context for AI agents and is designed to be both machine-accessible and human-readable.

## Project Information Hierarchy

Project information is organized in a hierarchical structure that enables precise context retrieval:

```
PROJECT/
├── metadata/                # Basic project information
│   ├── name                 # Project name
│   ├── description          # Short project description
│   ├── status               # Current project status
│   ├── created_at           # Creation date
│   └── updated_at           # Last update date
│
├── overview/                # Comprehensive project information
│   ├── mission              # Project mission and goals
│   ├── scope                # Project scope and boundaries
│   ├── stakeholders         # Key stakeholders and roles
│   └── timeline             # Major timeline milestones
│
├── architecture/            # Technical architecture information
│   ├── overview             # Architecture overview
│   ├── diagrams             # Architecture diagrams
│   ├── decisions            # Architecture decisions and rationale
│   └── constraints          # Technical constraints
│
├── tech-stack/              # Technologies used in the project
│   ├── frontend             # Frontend technologies and versions
│   ├── backend              # Backend technologies and versions
│   ├── infrastructure       # Infrastructure technologies
│   └── tools                # Development tools and utilities
│
├── patterns/                # Project-specific patterns
│   ├── coding               # Coding patterns
│   ├── architectural        # Architectural patterns
│   ├── design               # Design patterns
│   └── process              # Process patterns
│
└── resources/               # Additional project resources
    ├── repositories         # Code repositories
    ├── documentation        # External documentation links
    ├── environments         # Environment information
    └── contacts             # Contact information
```

## Project Knowledge Storage Format

Each type of project knowledge is stored in a specialized format optimized for both AI consumption and human readability:

### 1. Project Metadata

```json
{
  "id": "project-123",
  "name": "Convoy MVP",
  "description": "AI orchestration platform with human-in-the-loop workflow",
  "status": "ACTIVE",
  "created_at": "2023-04-01T00:00:00Z",
  "updated_at": "2023-04-14T15:30:45Z"
}
```

### 2. Project Overview

```markdown
# Convoy MVP Project Overview

## Mission

Convoy is an AI orchestration platform that enhances developer productivity by providing a structured human-in-the-loop workflow for software development tasks. The platform orchestrates AI agents within a human-supervised development process.

## Goals

1. **Improve Development Efficiency**: Reduce time spent on routine development tasks by 50%
2. **Maintain Quality**: Ensure all AI-developed code meets the same quality standards as human-developed code
3. **Enhance Collaboration**: Create seamless collaboration between AI agents and human developers
4. **Build Institutional Knowledge**: Capture development patterns and best practices in a reusable format

## Scope

### Included
- AI orchestration framework
- Task management integration with Linear
- Human review checkpoints
- Knowledge graph for context retrieval
- Pattern repository for reusable solutions

### Excluded
- Custom LLM training
- CI/CD integration (will be added in v2)
- Multi-team support (will be added in v2)
```

### 3. Architecture Overview

```markdown
# Convoy MVP Architecture

## Architecture Overview

Convoy MVP follows a simplified three-tier architecture:

1. **Frontend Tier**: React-based UI with shadcn/ui components
2. **Orchestration Tier**: Node.js orchestration layer
3. **Storage Tier**: Supabase for database and authentication

## Key Components

- **Convoy UI**: Web interface for task management and oversight
- **Orchestration Engine**: Coordinates AI agents and manages workflow
- **Knowledge Graph**: Stores project context and relationships
- **Memory Bank**: Provides structured context for AI agents
- **Linear Integration**: Synchronizes with Linear for task management

## Technical Decisions

### Database: Supabase
Selected for rapid development and built-in authentication. PostgreSQL backend provides robustness and JSON capabilities.

### UI Framework: React with shadcn/ui
Chosen for component reusability and modern design system. Shadcn/ui provides accessible, customizable components with minimal overhead.

### AI Integration: Claude API
Used for AI agent capabilities, offers strong reasoning and code generation with minimal hallucination.
```

### 4. Tech Stack

```yaml
# Convoy MVP Tech Stack

frontend:
  framework: React 18.2.0
  ui-library: shadcn/ui
  state-management: React Context
  styling: Tailwind CSS 3.3.0
  build-tool: Vite 4.3.1

backend:
  runtime: Node.js 18.15.0
  framework: Express 4.18.2
  database: PostgreSQL 15 (via Supabase)
  authentication: Supabase Auth
  ai-integration: Claude API

infrastructure:
  hosting: Vercel (frontend), Railway (backend)
  storage: Supabase
  ci-cd: GitHub Actions

development:
  language: TypeScript 5.0.4
  linting: ESLint 8.38.0
  formatting: Prettier 2.8.7
  testing: Jest 29.5.0, React Testing Library 14.0.0
  versioning: Git, GitHub
```

### 5. Patterns

```markdown
# API Endpoint Pattern

## Description
Standard structure for implementing REST API endpoints with consistent validation, error handling, and response formatting.

## Implementation
```typescript
// Controller structure
export const resourceController = {
  // GET /api/resource
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      // Input validation
      const schema = z.object({
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
      });
      
      const params = schema.parse(req.query);
      
      // Business logic
      const results = await resourceService.findAll(params);
      
      // Response formatting
      res.status(200).json({
        status: 'success',
        data: results,
        metadata: {
          total: results.length,
          limit: params.limit,
          offset: params.offset
        }
      });
    } catch (error) {
      // Error handling
      handleApiError(error, res);
    }
  },
  
  // Additional methods...
};
```

## Usage Instructions
1. Create a controller file for each resource
2. Implement standard CRUD methods following this pattern
3. Use Zod for input validation
4. Always wrap in try/catch and use the handleApiError utility
5. Follow the standard response format for consistency
```

## AI Retrieval Mechanisms

AI agents retrieve project knowledge using these mechanisms:

1. **Direct Access**: Retrieve specific information by ID or path
   ```
   PROJECT[project-123].overview.mission
   ```

2. **Hierarchical Traversal**: Navigate the hierarchy to build context
   ```
   TASK[task-456] → MILESTONE[milestone-789] → PROJECT[project-123]
   ```

3. **Knowledge Assembly**: Combine knowledge from multiple sources
   ```
   PROJECT[project-123].tech-stack + PROJECT[project-123].patterns.coding
   ```

4. **Context-Based Retrieval**: Gather knowledge relevant to a specific context
   ```
   getRelevantPatterns(PROJECT[project-123], "authentication")
   ```

## Benefits for AI Agents

This structure provides AI agents with these benefits:

1. **Complete Context**: Access to the full project context for decision-making
2. **Consistent Structure**: Predictable information organization for efficient retrieval
3. **Hierarchical Understanding**: Clear relationships between project elements
4. **Pattern Application**: Reusable patterns for consistent implementation
5. **Rich Metadata**: Additional context that improves AI reasoning

## Benefits for Humans

The project knowledge structure also benefits human team members:

1. **Documentation Hub**: Central location for project documentation
2. **Onboarding Resource**: Helps new team members understand the project
3. **Decision Record**: Captures rationale behind technical decisions
4. **Knowledge Persistence**: Prevents knowledge loss when team members leave
5. **Structured Updates**: Clear format for maintaining project information

## Example: Project Context for AI Agent

When an AI agent needs to work on a task in a project, it would receive context like this:

```markdown
# Project Context for: Convoy MVP

## Project Overview
Convoy is an AI orchestration platform that enhances developer productivity by providing a structured human-in-the-loop workflow for software development tasks.

## Architecture
The system uses a three-tier architecture with a React frontend, Node.js orchestration layer, and Supabase for storage.

## Tech Stack
- Frontend: React with shadcn/ui components
- Backend: Node.js with Express
- Database: PostgreSQL via Supabase
- Authentication: Supabase Auth

## Relevant Patterns
- **API Endpoint Pattern**: Standard structure for REST API endpoints
- **React Component Pattern**: Approach for creating reusable UI components
- **State Management Pattern**: Context-based state management approach

## Development Guidelines
- Follow TypeScript best practices with strict type checking
- Use ESLint and Prettier for code quality
- Write unit tests for all business logic
- Follow the git flow branching strategy
```

## Maintenance Guidelines

To maintain project knowledge:

1. **Regular Updates**: Update project knowledge whenever significant changes occur
2. **Review Cycle**: Schedule quarterly reviews of project knowledge
3. **Change Tracking**: Document major changes to project approach or architecture
4. **Version Alignment**: Ensure tech stack information stays current with actual versions
5. **Pattern Evolution**: Refine patterns based on implementation experience

By maintaining high-quality project knowledge, we ensure both AI agents and human team members have the context they need to make good decisions and implement features consistently.
