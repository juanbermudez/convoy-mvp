---
title: Convoy Hierarchy Structure
description: Guide to understanding the hierarchical structure of the Convoy system
---

# Convoy Hierarchy Structure Guide for AI Agents

## Introduction

As an AI agent working within the Convoy system, you need to understand the hierarchical structure that organizes all development work. This document explains how you should interpret and navigate this hierarchy to maintain context awareness during your tasks.

## The Four-Level Hierarchy

Convoy uses a four-level hierarchy for organizing work. You must understand your current position within this hierarchy when working on any task:

<Mermaid>
graph TD
    A[Workspace] --> B[Project]
    B --> C[Milestone]
    C --> D[Task]
    D --> E[Subtask]
    
    style A fill:#f9d5e5,stroke:#333,stroke-width:2px
    style B fill:#eeeeee,stroke:#333,stroke-width:2px
    style C fill:#d3e5f5,stroke:#333,stroke-width:2px
    style D fill:#d5f5d5,stroke:#333,stroke-width:2px
    style E fill:#f5f5d5,stroke:#333,stroke-width:2px
</Mermaid>

### Understanding Each Level

#### 1. Workspace

**Definition**: A top-level container that groups related projects, similar to a VS Code workspace.

**How to use it**: When you begin work on a task, identify which workspace it belongs to. The workspace provides important context about overall objectives and organizational boundaries.

**Examples**:
- "Convoy Development"
- "ETL Migration"
- "Customer Portal"

**Questions to ask yourself**:
- What workspace-level patterns apply to my current task?
- What are the workspace-wide best practices I should follow?
- What other projects in this workspace might be related to my work?

#### 2. Project

**Definition**: A major development initiative that maps directly to Linear projects.

**How to use it**: The project level gives you specific context about the goals, timeline, and requirements for a substantial body of work. Always frame your work within project objectives.

**Examples**:
- "Convoy MVP"
- "Data Warehouse Migration"
- "Authentication System Overhaul"

**Questions to ask yourself**:
- What are the key requirements for this project?
- What project-specific patterns should I apply?
- How does my task contribute to the project's goals?

#### 3. Milestone

**Definition**: A key deliverable checkpoint representing significant progress toward project goals.

**How to use it**: Milestones help you understand the timeline and sequence of development. They represent significant versions or achievements within a project.

**Examples**:
- "Auth System v1"
- "UI Refresh"
- "Database Schema Migration"

**Questions to ask yourself**:
- What is the target date for this milestone?
- What are the success criteria for this milestone?
- How does my task help complete this milestone?

#### 4. Task and Subtask

**Definition**: Tasks are individual work items that map to Linear issues, representing specific actions to be completed. Tasks can have parent-child relationships, forming a hierarchical structure for organizing related work.

**How to use it**: Tasks are your primary work unit. They have specific requirements, descriptions, and objectives that you must fulfill. Parent tasks can group related child tasks, providing better organization than the previous Slice concept.

**Examples**:
- Parent Task: "Implement Login System"
  - Child Task: "Create login form UI"
  - Child Task: "Add form validation"
  - Child Task: "Implement authentication logic"

**Questions to ask yourself**:
- What are the specific requirements for this task?
- Is this a parent task with child tasks? Or a child task of a parent?
- What is my current stage in the workflow for this task?
- What dependencies does this task have?

## How to Use Hierarchy in Your Work

### 1. Maintain Context Awareness

Always include the full hierarchical context when presenting your work:

```
I am working on:
- Workspace: Convoy Development
- Project: Convoy MVP
- Milestone: Auth System v1
- Task: Implement Login System
- Subtask: Create login form UI
```

### 2. Access the Knowledge Graph

When retrieving context for your task, traverse the knowledge graph to gather complete information:

1. Start with the task details
2. Include information from parent tasks (if this is a child task)
3. Add context from the milestone
4. Incorporate project requirements
5. Apply workspace-level patterns and best practices

### 3. Present Hierarchical Summaries

When creating summaries for checkpoints, include the complete hierarchy:

```
# Plan Review for Task: Create login form UI

## Context
- **Workspace**: Convoy Development
- **Project**: Convoy MVP
- **Milestone**: Auth System v1
- **Parent Task**: Implement Login System

## Task Description
[Task description here]

## Implementation Plan
[Plan details here]
```

### 4. Track Completion Up the Hierarchy

Understand that child task completion contributes to parent task completion, which contributes to milestone completion:

1. When you complete a task, check if all child tasks (if any) are now complete
2. When a parent task and all its children are complete, report completion status
3. When all tasks in a milestone are complete, check if the milestone is now complete
4. When a milestone is complete, check if all milestones in the project are complete

### 5. Reference Related Work

Use the hierarchy to reference related work:

```
This implementation follows the pattern established in the "User Management" parent task within the same milestone, specifically in the child task "Implement user profile UI".
```

## Example Hierarchy

To help you understand how this works in practice, here's a complete example hierarchy:

<Mermaid>
graph TD
    WS[Workspace: Convoy Development] --> P[Project: Convoy MVP]
    P --> M1[Milestone: Auth System v1]
    P --> M2[Milestone: UI Refresh]
    
    M1 --> T1[Task: Implement Login System]
    M1 --> T2[Task: User Session Management]
    
    T1 --> ST1[Subtask: Create login form UI]
    T1 --> ST2[Subtask: Add form validation]
    T1 --> ST3[Subtask: Implement authentication logic]
    
    T2 --> ST4[Subtask: Create JWT handler]
    T2 --> ST5[Subtask: Add persistent login]
    
    M2 --> T3[Task: Theme System Implementation]
    M2 --> T4[Task: Responsive Layout]
    
    T3 --> ST6[Subtask: Add theme toggle]
    T3 --> ST7[Subtask: Update color variables]
    
    T4 --> ST8[Subtask: Implement mobile menu]
    T4 --> ST9[Subtask: Fix container queries]
    
    style WS fill:#f9d5e5,stroke:#333,stroke-width:2px
    style P fill:#eeeeee,stroke:#333,stroke-width:2px
    style M1 fill:#d3e5f5,stroke:#333,stroke-width:2px
    style M2 fill:#d3e5f5,stroke:#333,stroke-width:2px
    style T1 fill:#d5f5d5,stroke:#333,stroke-width:2px
    style T2 fill:#d5f5d5,stroke:#333,stroke-width:2px
    style T3 fill:#d5f5d5,stroke:#333,stroke-width:2px
    style T4 fill:#d5f5d5,stroke:#333,stroke-width:2px
    style ST1 fill:#f5f5d5,stroke:#333,stroke-width:2px
    style ST2 fill:#f5f5d5,stroke:#333,stroke-width:2px
    style ST3 fill:#f5f5d5,stroke:#333,stroke-width:2px
    style ST4 fill:#f5f5d5,stroke:#333,stroke-width:2px
    style ST5 fill:#f5f5d5,stroke:#333,stroke-width:2px
    style ST6 fill:#f5f5d5,stroke:#333,stroke-width:2px
    style ST7 fill:#f5f5d5,stroke:#333,stroke-width:2px
    style ST8 fill:#f5f5d5,stroke:#333,stroke-width:2px
    style ST9 fill:#f5f5d5,stroke:#333,stroke-width:2px
</Mermaid>

## Conclusion

By keeping this hierarchical structure in mind as you work, you'll maintain better context awareness, create more coherent implementations, and produce work that fits seamlessly into the larger project. Always reference where your task fits in this hierarchy to ensure you understand its full context and purpose.
