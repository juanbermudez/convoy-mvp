---
title: Convoy Initiatives
description: Overview of all initiatives in the Convoy system
---

# Convoy Initiatives

This directory contains documentation for all initiatives within the Convoy system. Each initiative has its own directory containing projects, plans, tasks, and other initiative-specific documentation.

## Initiative Structure

Each initiative directory follows this standardized structure:

```
INIT-{id}-{name}/
├── README.md                  # Initiative overview
├── metadata.md                # Initiative metadata and settings
└── projects/                  # Projects within this initiative
    ├── README.md              # Overview of all projects in this initiative
    └── PROJ-{id}-{name}/      # Individual project folder
        ├── overview.md        # Project overview, goals, constraints
        ├── plan.md            # Implementation plan
        └── tasks/             # Tasks within this project
            ├── README.md      # Overview of all tasks in this project
            └── TASK-{id}-{name}.md  # Individual task documents
```

## Initiative Naming Convention

Initiatives follow an ID-based naming convention:

```
INIT-{id}-{name}/
```

For example:
- `INIT-001-convoy-development/`
- `INIT-002-client-projects/`
- `INIT-003-research-initiative/`

## Current Initiatives

- [INIT-001-convoy-development](./INIT-001-convoy-development/) - Primary development initiative for the Convoy system

## Status-Based Work Control

The Convoy system implements status-based work control to manage what tasks an AI agent can work on:

### Initiative Status
- **active**: Work is actively being done in this initiative
- **completed**: All work in this initiative is complete
- **archived**: Initiative is no longer active but kept for reference

### Project Status
- **planned**: Project is planned but not ready for work
- **active**: Work is actively being done on this project
- **completed**: All tasks in this project are completed

### Task Status
- **backlog**: Tasks that are planned but not ready for implementation
- **to-do**: Tasks that are ready for the AI agent to work on
- **in-progress**: Tasks currently being worked on
- **completed**: Tasks that have been completed

AI agents will only work on tasks that are:
1. Within an active initiative
2. Part of an active project
3. Explicitly marked with "to-do" status

## Initiative Guidelines

When creating or updating initiative documentation:

1. Use the standard ID-based naming convention
2. Include complete metadata in all documentation files
3. Maintain consistent structure across initiatives
4. Keep initiative documentation up-to-date as projects evolve
5. Clearly mark the status of initiatives, projects, and tasks

This documentation structure mirrors the Convoy knowledge graph structure, providing a clear hierarchical organization from initiatives down to individual tasks.
