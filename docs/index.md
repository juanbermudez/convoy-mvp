---
title: Convoy Documentation
description: Documentation for the Convoy AI orchestration platform
---

# Welcome to Convoy Documentation

Convoy is an AI orchestration platform that enhances AI agent capabilities through structured workflows and knowledge graphs, using prompt engineering techniques inspired by the Cline Memory Bank pattern.

## What is Convoy?

Convoy is a prompt engineering approach to enhancing AI agent capabilities through structured workflows and knowledge graphs. Rather than building a separate application, Convoy leverages Cline's existing rule system to guide AI behavior while using Supabase for data storage.

The heart of Convoy is a carefully crafted Cline rule (.clinerules file) that instructs the AI agent to:

1. Follow a structured workflow with clear stages
2. Retrieve context from a knowledge graph stored in Supabase
3. Pause at checkpoints for human approval
4. Document all activities for transparency

This approach shifts the focus from coding to planning and oversight, allowing humans to guide AI development through structured checkpoints while maintaining complete visibility.

## Key Concepts

### 1. Memory Bank Pattern

The Memory Bank pattern is a prompt engineering approach that structures context retrieval for AI agents. It organizes information in a way that's optimized for AI consumption, enabling more effective reasoning and implementation.

### 2. Hierarchical Structure

Convoy uses a hierarchical structure to organize work:

```
WORKSPACE
 └── PROJECT
      └── MILESTONE
           └── TASK
                └── SUBTASK
```

Tasks can have parent-child relationships, allowing for logical grouping of related work items. This hierarchy provides clear context for AI agents and aligns with Linear's project management structure. [Learn more about the hierarchy structure](/docs/core-concepts/hierarchy-structure).

### 3. Workflow Stages

Every task follows a structured workflow:

```
┌─────────┐     ┌────────────┐     ┌───────────┐     ┌──────────┐     ┌─────────────┐     ┌────────┐
│         │     │            │     │           │     │          │     │             │     │        │
│  PLAN   ├────►│ PLAN_REVIEW├────►│ IMPLEMENT ├────►│ VALIDATE ├────►│ CODE_REVIEW ├────►│ COMMIT │
│         │     │            │     │           │     │          │     │             │     │        │
└─────────┘     └────────────┘     └───────────┘     └──────────┘     └─────────────┘     └────────┘
     AI             Human              AI               AI               Human              AI
```

The workflow includes human checkpoints at critical decision points.

### 4. Knowledge Graph

The knowledge graph connects entities (workspaces, projects, milestones, tasks) with their relationships, enabling AI agents to retrieve complete context for tasks.

### 5. AI Prompt Engineering

Instead of traditional code, Convoy uses prompt engineering techniques to guide AI behavior. The Cline rule is a carefully crafted prompt that instructs the AI on how to approach tasks, retrieve context, and interact with humans.

## Getting Started

- [Simplified Solution Summary](/docs/simplified-solution-summary) - High-level overview of the approach
- [Memory Bank Pattern](/docs/core-concepts/memory-bank) - Explains the core Memory Bank concept
- [Hierarchy Structure](/docs/core-concepts/hierarchy-structure) - Understanding the Task-based hierarchy
- [AI Workflow Guidelines](/docs/ai-guidelines/ai-workflow-guidelines) - Detailed guidelines for AI agents
- [Implementation Roadmap](/docs/implementation/prompt-based-roadmap) - Implementation roadmap
- [Convoy Workflow](/docs/convoy-workflow-updated) - Visual explanation of the Convoy workflow using Mermaid diagrams

## Documentation Features

- [Mermaid Diagrams](/docs/mdx/mermaid) - Learn how to create diagrams in your documentation

## Implementation Approach

Convoy is implemented through:

1. **Supabase Database**: Stores the knowledge graph, activity feed, and patterns
2. **Cline Rules**: Prompt engineering approach that guides AI behavior
3. **Simplified UI**: Basic interface for task management and knowledge graph visualization

This approach minimizes implementation complexity while maintaining the core benefits of structured context retrieval and human oversight.
