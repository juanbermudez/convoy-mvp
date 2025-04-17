---
id: INIT-001
name: Convoy Development
description: Primary development initiative for the Convoy MVP
created_at: 2025-04-14
updated_at: 2025-04-14
status: active
planned_projects:
  - PROJ-002: Cline Rule Development
  - PROJ-003: Web Interface Development
  - PROJ-004: Dogfooding Project
active_projects:
  - PROJ-001: Supabase Integration
---

# Convoy Development Initiative Metadata

This document contains metadata and settings for the Convoy Development initiative.

## Initiative Settings

| Setting | Value |
|---------|-------|
| ID | INIT-001 |
| Name | Convoy Development |
| Description | Primary development initiative for the Convoy MVP |
| Created | 2025-04-14 |
| Updated | 2025-04-14 |
| Status | Active |
| Owner | Convoy Team |

## Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| Supabase | Database, Authentication | Latest |
| PostgreSQL | Relational Database | 15.x |
| Next.js | Web Interface | 14.x |
| shadcn/ui | UI Components | Latest |
| Cline | AI Agent | Latest |

## Initiative Configuration

```json
{
  "initiative": {
    "id": "INIT-001",
    "name": "Convoy Development",
    "default_workflow": "standard_dev_workflow"
  },
  "patterns": {
    "code": "docs/patterns/code",
    "ui": "docs/patterns/ui",
    "documentation": "docs/patterns/documentation"
  },
  "best_practices": {
    "code_style": "docs/best-practices/code-style.md",
    "testing": "docs/best-practices/testing.md",
    "documentation": "docs/best-practices/documentation.md"
  }
}
```

## Project Structure

The initiative contains the following project categories:

1. **Core Infrastructure**
   - PROJ-001: Supabase Integration (Active)
   - PROJ-002: Cline Rule Development (Planned)

2. **User Interface**
   - PROJ-003: Web Interface Development (Planned)

3. **Evaluation & Refinement**
   - PROJ-004: Dogfooding Project (Planned)

## Roadmap Implementation

This initiative implements the complete Convoy roadmap:

| Phase | Project | Status | Duration |
|-------|---------|--------|----------|
| Phase 1 | PROJ-001: Supabase Integration | Active | 1-2 days |
| Phase 2 | PROJ-002: Cline Rule Development | Planned | 1-2 days |
| Phase 3 | PROJ-003: Web Interface Development | Planned | 2-3 days |
| Phase 4 | PROJ-004: Dogfooding Project | Planned | 2-3 days |

## Initiative Guidelines

- All work follows the standard development workflow
- Documentation follows the templates defined in `/docs/ai-agent-rules/documentation-guidelines.md`
- Code follows the patterns and best practices defined in the initiative
- Regular reviews ensure alignment with initiative objectives
- Tasks must be explicitly set to "to-do" status for AI agents to work on them

## Task Status Control

| Status | Description | Can be processed by AI |
|--------|-------------|------------------------|
| backlog | Tasks that are planned but not ready yet | No |
| to-do | Tasks that are ready to be worked on | Yes (if in active project) |
| in-progress | Tasks currently being worked on | No (already in progress) |
| completed | Tasks that have been completed | No (already completed) |

## Access Controls

| Role | Permissions |
|------|-------------|
| Admin | Full access to all projects and settings |
| Developer | Access to assigned projects and tasks |
| Reviewer | Read access to all projects, approval rights for checkpoints |
| Viewer | Read-only access to documentation and completed work |

This metadata file serves as a reference for all work within the Convoy Development initiative.
