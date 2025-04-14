---
title: Simplified Workflow
description: The core workflow stages and checkpoints in the Convoy system
---

# Simplified Workflow

## Overview

This document outlines the implementation of the Convoy workflow system, designed to be immediately implementable using Cline as the AI agent and Supabase for data storage. The workflow focuses on core stages with human checkpoints at critical points.

## Core Workflow Stages

```
┌─────────┐     ┌────────────┐     ┌───────────┐     ┌──────────┐     ┌─────────────┐     ┌────────┐
│         │     │            │     │           │     │          │     │             │     │        │
│  PLAN   ├────►│ PLAN_REVIEW├────►│ IMPLEMENT ├────►│ VALIDATE ├────►│ CODE_REVIEW ├────►│ COMMIT │
│         │     │            │     │           │     │          │     │             │     │        │
└─────────┘     └────────────┘     └───────────┘     └──────────┘     └─────────────┘     └────────┘
     AI             Human              AI               AI               Human              AI
```

### 1. PLAN Stage
- AI agent analyzes the task and creates a step-by-step plan
- Produces a clear plan document with specific sub-tasks
- Ends with PLAN_REVIEW checkpoint requiring human approval

### 2. IMPLEMENT Stage
- AI agent executes the approved plan
- Writes code, creates files, runs commands as needed
- Records all actions in the Activity Feed

### 3. VALIDATE Stage
- AI agent verifies the implementation
- Runs tests, linting, builds as appropriate
- Summarizes changes and validation results
- Ends with CODE_REVIEW checkpoint requiring human approval

### 4. COMMIT Stage
- AI agent prepares changes for commit
- Generates a commit message
- Executes the commit upon human approval

## Checkpoint Implementation

Checkpoints are critical points where human review and approval are required. There are two main checkpoints:

### PLAN_REVIEW Checkpoint
- **Trigger**: When the AI completes the PLAN stage
- **Action**: 
  1. AI generates a summary of the plan
  2. Records checkpoint in Activity Feed
  3. Pauses execution waiting for human approval
- **Human Options**:
  1. Approve: Proceed to IMPLEMENT stage
  2. Request Revision: AI revises plan based on feedback
  3. Reject: Task is marked as rejected and workflow ends

### CODE_REVIEW Checkpoint
- **Trigger**: When the AI completes the VALIDATE stage
- **Action**:
  1. AI summarizes implemented changes and validation results
  2. Records checkpoint in Activity Feed
  3. Pauses execution waiting for human approval
- **Human Options**:
  1. Approve: Proceed to COMMIT stage
  2. Request Revision: AI makes requested code changes
  3. Reject: Task is marked as rejected and workflow ends

## Workflow Definition

The workflow is defined in a structured format that clearly outlines each stage and its properties:

```json
{
  "id": "standard_dev_workflow",
  "name": "Standard Development Workflow",
  "description": "A six-stage workflow with human checkpoints for plan and code review",
  "stages": [
    {
      "name": "PLAN",
      "description": "Analyze task and create implementation plan",
      "order": 1,
      "is_checkpoint": false
    },
    {
      "name": "PLAN_REVIEW",
      "description": "Human review of the implementation plan",
      "order": 2,
      "is_checkpoint": true,
      "checkpoint_type": "PLAN_REVIEW"
    },
    {
      "name": "IMPLEMENT",
      "description": "Execute the approved plan",
      "order": 3,
      "is_checkpoint": false
    },
    {
      "name": "VALIDATE",
      "description": "Verify implementation through tests and validation",
      "order": 4,
      "is_checkpoint": false
    },
    {
      "name": "CODE_REVIEW",
      "description": "Human review of the implemented code",
      "order": 5,
      "is_checkpoint": true,
      "checkpoint_type": "CODE_REVIEW"
    },
    {
      "name": "COMMIT",
      "description": "Prepare and execute commit",
      "order": 6,
      "is_checkpoint": false
    }
  ]
}
```

## Prompt Engineering Approach

For Claude and other AI systems to follow this workflow, we implement it as a prompt pattern rather than executable code:

```
# Convoy Workflow Instructions

You are following the Convoy development workflow, which consists of these stages:

1. PLAN: Create a detailed implementation plan
   - Analyze requirements
   - Break down the task into steps
   - Consider potential challenges

2. PLAN_REVIEW: Pause for human approval
   - Present your plan clearly
   - Wait for explicit approval to proceed

3. IMPLEMENT: Execute the approved plan
   - Follow the plan step by step
   - Document your progress
   - Record any deviations

4. VALIDATE: Verify your implementation
   - Run appropriate tests
   - Check against requirements
   - Document any issues found

5. CODE_REVIEW: Pause for human approval
   - Present implementation summary
   - Include validation results
   - Wait for explicit approval

6. COMMIT: Finalize approved changes
   - Generate commit message
   - Prepare changes for commit
   - Mark task as completed

IMPORTANT: Never skip stages or proceed past a checkpoint without explicit human approval.
```

## Database Implementation

In Supabase, the workflow is stored and managed through these tables:

```sql
-- Workflows table
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stages JSONB NOT NULL
);

-- Task workflow state
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID REFERENCES milestones(id),
  parent_task_id UUID REFERENCES tasks(id),
  title TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT DEFAULT 'standard_dev_workflow',
  current_stage TEXT DEFAULT 'PLAN',
  status TEXT DEFAULT 'PLANNED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Feed for tracking workflow progress
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id),
  type TEXT NOT NULL,
  content TEXT,
  checkpoint_type TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL
);
```

This simplified workflow provides a clear structure for AI agents to follow, with appropriate human checkpoints at critical decision points. The implementation is intentionally minimal, focusing on the core stages needed for a functional software development process, while still providing adequate human oversight.
