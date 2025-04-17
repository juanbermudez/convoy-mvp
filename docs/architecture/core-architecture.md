---
title: Core Architecture
description: The foundational architecture and concepts of the Convoy platform
---

# Core Architecture

This document explains the fundamental concepts and architecture of the Convoy platform, including the Memory Bank pattern, hierarchical structure, knowledge graph, and workflow process.

## Memory Bank Pattern

The Memory Bank pattern is the foundational concept in Convoy that structures how AI agents retrieve and use context.

### Core Concept

The Memory Bank pattern provides a structured approach for AI agents to retrieve comprehensive context about their tasks. Unlike traditional documentation that's optimized for human consumption, the Memory Bank organizes information in a way that's specifically designed for AI agents to consume efficiently.

### Key Benefits

1. **Comprehensive Context**: Provides AI agents with complete information about tasks, their place in the hierarchy, and relevant patterns
2. **Efficient Retrieval**: Structures information for optimal traversal and relevance
3. **Reduced Hallucinations**: Grounds AI responses in factual project context
4. **Consistent Implementation**: Ensures AI agents follow established patterns and practices

## Hierarchical Structure

Convoy uses a five-level hierarchical structure to organize work and provide context.

### The Five-Level Hierarchy

```
WORKSPACE
 └── PROJECT
      └── MILESTONE
           └── SLICE
                └── TASK
```

Each level has a specific purpose:

1. **Workspace**: Top-level container representing an organization or major division
   - Contains shared patterns and best practices
   - Provides organizational context

2. **Project**: Specific initiative with defined goals and technology choices
   - Has clear objectives and scope
   - Contains project-specific patterns

3. **Milestone**: Significant deliverable or phase within a project
   - Has target dates and requirements
   - Groups related tasks together

4. **Slice**: Logical grouping of related tasks
   - Similar to "epics" or "stories" in agile methodologies
   - Creates manageable units of work

5. **Task**: Atomic unit of work
   - Has clear requirements
   - Follows the standard workflow
   - Can have parent-child relationships

### Parent-Child Relationships

Tasks can be organized in parent-child relationships to break down complex work:

```
PARENT TASK
 ├── CHILD TASK 1
 ├── CHILD TASK 2
 └── CHILD TASK 3
```

This allows for:
- Better organization of complex work
- Clearer dependencies between tasks
- More granular checkpoint control

## Knowledge Graph Design

The knowledge graph connects entities and their relationships, enabling AI agents to retrieve rich context.

### Entity Relationships

```
                   ┌─────────────┐
                   │             │
                   │  Workspace  │
                   │             │
                   └──────┬──────┘
                          │
                          │
                   ┌──────▼──────┐
                   │             │
                   │   Project   │
                   │             │
                   └──────┬──────┘
                          │
                          │
                   ┌──────▼──────┐
                   │             │
                   │  Milestone  │
                   │             │
                   └──────┬──────┘
                          │
                          │
                   ┌──────▼──────┐
                   │             │
                   │    Slice    │────┐
                   │             │    │
                   └──────┬──────┘    │
                          │           │
                ┌─────────┴─────────┐ │
                │                   │ │
         ┌──────▼──────┐     ┌──────▼──────┐
         │             │     │             │
         │    Task     │     │    Task     │
         │             │     │             │
         └─────────────┘     └─────────────┘
```

Supporting entities enhance the knowledge graph:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Workflows  │     │  Patterns   │     │    Best     │
│             │     │             │     │  Practices  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                  │                   │
       └──────────────────┼───────────────────┘
                          │
                          ▼
                  Applied to entities
                  at different levels
```

### Traversal Mechanisms

AI agents navigate the knowledge graph using several traversal mechanisms:

1. **Hierarchy Traversal**: Starting from a task, move up through parent entities
   ```
   Task → Slice → Milestone → Project → Workspace
   ```

2. **Relationship Traversal**: Follow relationships between entities
   ```
   Task → Related Tasks → Applied Patterns → Best Practices
   ```

3. **Activity Traversal**: Review the history of activities
   ```
   Task → Activity Feed → Previous Decisions → Human Feedback
   ```

### Context Assembly

When retrieving context, the AI agent:
1. Starts with the task details
2. Traverses up the hierarchy to gather parent context
3. Identifies relevant patterns and best practices
4. Reviews the activity history
5. Assembles a comprehensive context

The assembled context includes:
- Complete hierarchical path
- Task requirements and details
- Relevant patterns and best practices
- Recent activity and decisions
- Related tasks and dependencies

## Workflow Process

Convoy uses a streamlined six-stage workflow with human checkpoints.

### Six-Stage Workflow

Every task follows this workflow:

```
┌─────────┐     ┌────────────┐     ┌───────────┐     ┌──────────┐     ┌─────────────┐     ┌────────┐
│         │     │            │     │           │     │          │     │             │     │        │
│  PLAN   ├────►│ PLAN_REVIEW├────►│ IMPLEMENT ├────►│ VALIDATE ├────►│ CODE_REVIEW ├────►│ COMMIT │
│         │     │            │     │           │     │          │     │             │     │        │
└─────────┘     └────────────┘     └───────────┘     └──────────┘     └─────────────┘     └────────┘
     AI             Human              AI               AI               Human              AI
```

The workflow includes two human checkpoints (PLAN_REVIEW and CODE_REVIEW) where explicit approval is required.

### Stage Descriptions

1. **PLAN**: AI analyzes requirements and creates implementation plan
2. **PLAN_REVIEW**: Human reviews and approves plan
3. **IMPLEMENT**: AI follows approved plan to make changes
4. **VALIDATE**: AI tests and verifies the implementation
5. **CODE_REVIEW**: Human reviews implementation and validation
6. **COMMIT**: AI finalizes changes and completes task

### Human Checkpoints

At the checkpoint stages (PLAN_REVIEW and CODE_REVIEW):
1. The AI agent pauses and waits for explicit human approval
2. The human reviews the AI's work and provides feedback
3. The AI addresses any feedback before proceeding
4. The workflow only continues after explicit approval

### Activity Tracking

Every action is recorded in the activity feed, creating a transparent record of:
- Stage transitions
- Implementation decisions
- Validation results
- Human feedback
- Revision requests

## System Components

The Convoy architecture consists of these key components:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│   AI Rules    │────►│  AI Assistant │────►│  Web Dashboard│
│               │     │               │     │               │
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        │                     │                     │
        │                     │                     │
        │                     ▼                     │
        │             ┌───────────────┐             │
        └────────────►│   Knowledge   │◄────────────┘
                      │     Graph     │
                      │               │
                      └───────────────┘
```

1. **AI Rules**: Define the Memory Bank pattern, workflow stages, and AI behavior
2. **AI Assistant**: Follows rules, retrieves context, and executes tasks
3. **Knowledge Graph**: Stores structured project information
4. **Web Dashboard**: Provides human interface for oversight and management

## Data Flow

1. **Task Assignment**: Human creates task with hierarchical context
2. **Context Retrieval**: AI traverses knowledge graph for complete context
3. **Workflow Execution**: AI follows stages, documents activities, pauses at checkpoints
4. **Human Oversight**: Human provides approval or feedback at checkpoints

## Design Principles

Convoy's architecture follows these key principles:

1. **Simplicity Over Complexity**: Minimize custom code and infrastructure
2. **Human-in-the-Loop**: Ensure critical decisions require human approval
3. **Knowledge Graph Structure**: Organize information for optimal AI consumption
4. **Complete Transparency**: Document all activities and decisions
5. **Prompt Engineering Focus**: Use language model instructions rather than custom code
