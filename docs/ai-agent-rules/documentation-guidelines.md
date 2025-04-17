---
title: Documentation Guidelines
description: Guidelines for maintaining documentation in the Convoy system
---

# Documentation Guidelines

## Overview

As an AI assistant in the Convoy system, you are responsible for maintaining comprehensive documentation throughout the development process. This document provides detailed guidance on the documentation structure and procedures to follow for all initiatives, projects, and tasks.

## Documentation Structure

The Convoy documentation follows a structured approach that mirrors the system's knowledge graph hierarchy:

```
docs/
├── core-concepts/        # Foundational concepts of the Convoy system
├── technical/            # Technical documentation and reference
├── workflows/            # Workflow definitions and procedures
├── ai-agent-rules/       # Rules and guidelines for AI agents
├── workspace/            # Initiative-level documentation
│   ├── README.md         # Overview of all initiatives
│   └── INIT-{id}-{name}/ # Individual initiative folder
│       ├── README.md     # Initiative overview
│       ├── metadata.md   # Initiative metadata
│       └── projects/     # Projects within this initiative
│           ├── README.md # Overview of all projects
│           └── PROJ-{id}-{name}/ # Individual project folder
│               ├── overview.md   # Project overview, goals, constraints
│               ├── plan.md       # Implementation plan
│               └── tasks/        # Task documentation
│                   ├── README.md # Overview of all tasks
│                   └── TASK-{id}-{name}.md # Individual task documents
└── roadmap/              # Implementation roadmap and future plans
```

## Naming Conventions

### Initiative/Workspace Naming

Initiatives follow an ID-based naming convention:
```
INIT-{id}-{name}/
```

Examples:
- `INIT-001-convoy-development/`
- `INIT-002-client-projects/`

### Project Naming

Projects follow an ID-based naming convention:
```
PROJ-{id}-{name}/
```

Examples:
- `PROJ-001-supabase-integration/`
- `PROJ-002-cline-rule-development/`

### Task Naming

Tasks follow an ID-based naming convention:
```
TASK-{id}-{name}.md
```

Examples:
- `TASK-001-supabase-project-setup.md`
- `TASK-002-declarative-schema-creation.md`

## Status-Based Work Control

The Convoy system implements status controls to manage what tasks are eligible for AI processing:

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

**IMPORTANT**: AI agents will only work on tasks that meet ALL of the following criteria:
1. Within an active initiative
2. Part of an active project
3. Explicitly marked with "to-do" status

## Metadata Requirements

### Initiative Metadata (`metadata.md`)

```markdown
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
active_projects:
  - PROJ-001: Supabase Integration
---
```

### Project Overview (`overview.md`)

```markdown
---
id: PROJ-001
name: Supabase Integration
description: Setting up the Supabase infrastructure for the Convoy knowledge graph
created_at: 2025-04-14
updated_at: 2025-04-14
status: active
priority: high
parent_id: INIT-001
parent_name: Convoy Development
planned_tasks:
  - TASK-002: Declarative Schema Creation
  - TASK-003: Core Table Implementation
active_tasks:
  - TASK-001: Supabase Project Setup
---
```

### Task Documentation (`TASK-{id}-{name}.md`)

```markdown
---
title: Supabase Project Setup
id: TASK-001
type: feature
status: to-do
priority: high
assignee: AI Agent
created_at: 2025-04-14
updated_at: 2025-04-14
initiative: INIT-001
initiative_name: Convoy Development
project: PROJ-001
project_name: Supabase Integration
current_stage: PLAN
# Source control information (added after completion)
branch: task/TASK-001-description
commit_hash: abc123def456
pull_request: https://github.com/org/repo/pull/123
merged: true|false
---
```

## Documentation Procedures

### 1. Creating New Initiative Documentation

When a new initiative is created:

1. Create a new directory under `docs/workspace/INIT-{id}-{name}/`
2. Create a `README.md` file with initiative overview
3. Create a `metadata.md` file with initiative metadata
4. Create a `projects` directory for project documentation

### 2. Creating New Project Documentation

When a new project is initiated:

1. Create a new directory under `docs/workspace/INIT-{id}-{name}/projects/PROJ-{id}-{name}/`
2. Create an `overview.md` file with project details
3. Create a `plan.md` file with implementation plan
4. Create a `tasks` directory for task documentation
5. Update the parent initiative's metadata to include the new project

### 3. Creating Task Documentation

When a task is defined:

1. Create a new file under `docs/workspace/INIT-{id}-{name}/projects/PROJ-{id}-{name}/tasks/`
2. Name the file `TASK-{id}-{name}.md` with a descriptive name
3. Include complete metadata, task description, implementation details, sub-tasks, dependencies, and completion criteria
4. Set the initial status to "backlog" or "to-do" as appropriate
5. Update the project overview to reference the new task

### 4. Updating Task Status

When a task's status changes:

1. Update the `status` field in the task's metadata
2. Update the parent project's `active_tasks` and `planned_tasks` lists if needed
3. Document the status change in the activity log
4. Only set a task to "to-do" when it is genuinely ready for implementation

### 5. Final Documentation

Upon project completion:

1. Update all documentation to reflect the final state
2. Set all task statuses to "completed"
3. Set the project status to "completed"
4. Update the initiative metadata to reflect completed projects
5. Document any lessons learned or future recommendations

## Task Documentation Template

For each task, include:

```markdown
---
title: [Task Title]
id: TASK-[ID]
type: [feature|bugfix|documentation|etc]
status: [backlog|to-do|in-progress|completed]
priority: [low|medium|high]
assignee: [Name or AI Agent]
created_at: [YYYY-MM-DD]
updated_at: [YYYY-MM-DD]
initiative: INIT-[ID]
initiative_name: [Initiative Name]
project: PROJ-[ID]
project_name: [Project Name]
current_stage: [PLAN|PLAN_REVIEW|IMPLEMENT|VALIDATE|CODE_REVIEW|COMMIT]
# Source control fields (added after completion)
branch: task/TASK-[ID]-[kebab-case-description]
commit_hash: [hash]
pull_request: [URL] (optional)
merged: [true|false] (optional)
---

# Task [ID]: [Task Name]

## Task Description
[Detailed description of what this task entails]

## Implementation Details
[Technical approach and implementation strategy]

## Sub-Tasks

### Sub-Task 1: [Sub-Task Name]
- Description: [description]
- Implementation: [implementation details]
- Completion Criteria: [criteria]

### Sub-Task 2: [Sub-Task Name]
- Description: [description]
- Implementation: [implementation details]
- Completion Criteria: [criteria]

...

## Dependencies
- Requires: [task dependencies]
- Blocks: [tasks blocked by this one]

## Completion Criteria
- [Criterion 1]
- [Criterion 2]
- ...

## Source Control
- **Branch**: `task/TASK-[ID]-[kebab-case-description]`
- **Commit**: `[commit hash]`
- **Pull Request**: [PR #123](https://github.com/org/repo/pull/123) (if applicable)
- **Merged**: Yes/No (if applicable)

## AI Agent Notes
[Notes specific to AI agent processing, eligibility, etc.]

## Activity Log

| Date | Stage | Activity | Author |
|------|-------|----------|--------|
| [YYYY-MM-DD] | [STAGE] | [Activity description] | [Author] |
```

## Documentation in the Workflow Stages

Documentation responsibilities across workflow stages:

### PLAN Stage
- Create or update task documentation
- Break down complex tasks into sub-tasks
- Document implementation approach and steps
- Ensure task has complete metadata

### IMPLEMENT Stage
- Update task status to "in-progress"
- Update task documentation with implementation details
- Document any deviations from the plan
- Add technical notes and explanations

### VALIDATE Stage
- Document validation results
- Update task documentation with validation notes
- Document any issues found and resolutions

### COMMIT Stage
- Finalize all documentation
- Create/verify source control branch following naming convention
- Execute Git operations (add, commit, push) with standardized commit message
- Document source control details in task metadata and documentation
- Update task status to "completed"
- Ensure documentation accuracy and completeness
- Update parent project metadata if needed

## Status Checking Requirements

As an AI agent, you MUST perform these checks before processing any task:

1. Check the parent initiative status - must be "active"
2. Check the parent project status - must be "active"
3. Check the task status - must be "to-do"

If ANY of these conditions are not met, you must NOT process the task. Instead, inform the user that the task is not eligible for processing and explain why.

## Source Control Integration

When completing tasks that involve code changes, proper source control documentation is essential:

### 1. Branch Naming Convention

Always use a consistent branch naming convention:

```
task/TASK-{id}-{kebab-case-description}
```

Examples:
- `task/TASK-001-supabase-project-setup`
- `task/TASK-002-declarative-schema-creation`

### 2. Commit Message Format

Use conventional commits format for all commit messages:

```
[type]([scope]): [brief description]

[detailed description]

Task: TASK-[id] - [task title]
Project: PROJ-[id] - [project name]
Initiative: INIT-[id] - [initiative name]
```

Where type is one of:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting changes
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI configuration changes
- `chore`: Other changes that don't modify source

### 3. Source Control Documentation

After committing, document source control details in:

1. Task metadata - Add source control fields to the YAML frontmatter
2. Task documentation - Add a Source Control section before the AI Agent Notes section
3. Activity log - Record commit details with date, hash, and branch

### 4. Pull Request Documentation

When applicable, include pull request information:
- Link to the PR in the Source Control section
- Update the task metadata with the PR URL 
- Add PR status (open, merged, closed) to the documentation

## Best Practices for Documentation

### 1. Clarity and Structure
- Use clear, concise language
- Follow consistent formatting
- Use headers, lists, and tables for organization
- Include code blocks with appropriate syntax highlighting

### 2. Comprehensiveness
- Document all aspects of the initiative/project/task
- Include both technical and non-technical information
- Provide context for decisions
- Document assumptions and constraints

### 3. Metadata Accuracy
- Ensure all metadata fields are complete and accurate
- Keep statuses updated as work progresses
- Maintain accurate parent-child relationships
- Use consistent ID formats

### 4. Status Management
- Only set tasks to "to-do" when they are ready for implementation
- Update statuses promptly as work progresses
- Maintain accurate active/planned lists in parent entities
- Only process tasks explicitly marked as "to-do"

### 5. Accessibility
- Write for different audience levels
- Define technical terms when necessary
- Use diagrams and visual aids where helpful
- Create clear navigation between documents

By following these guidelines, you'll maintain comprehensive documentation that enhances project transparency, facilitates knowledge transfer, and supports the Convoy system's goals.
