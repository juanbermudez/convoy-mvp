---
title: Prompt-Based Roadmap
description: Implementation roadmap using prompt engineering for Convoy
---

# Prompt-Based Implementation Roadmap

## Overview

This roadmap outlines a prompt engineering approach to implementing Convoy. Instead of writing custom code, we leverage Cline's rule system to create a powerful AI agent that follows structured workflows and maintains context through a knowledge graph stored in Supabase.

## Phase 1: Supabase Setup & Rule Creation (1-2 days)

### Goals
- Create Supabase project with essential schema
- Craft a Cline rule file for AI agent guidance

### Tasks
1. **Setup Supabase Project**
   - Create new Supabase project
   - Implement core tables:
     - workspaces
     - projects
     - milestones
     - tasks
     - workflows
     - activity_feed
     - patterns
     - best_practices
   - Seed with standard workflow definition

2. **Create Convoy Cline Rule**
   - Craft comprehensive .clinerules file with:
     - Knowledge graph structure explanation
     - Workflow stage definitions
     - Checkpoint handling instructions
     - Context retrieval guidance
     - Activity documentation requirements

3. **Test Basic Interaction**
   - Add the rule file to Cline
   - Test initial task execution
   - Verify rule is being followed

### Validation Criteria
- Supabase schema matches knowledge graph requirements
- Cline rule correctly guides AI behavior
- Basic task assignment works with the rule

## Phase 2: MCP Functions & Rule Refinement (1-2 days)

### Goals
- Create Supabase functions for knowledge graph access
- Refine Cline rule based on initial testing

### Tasks
1. **Create Supabase Functions**
   - Implement task storage and retrieval
   - Implement workflow stage transitions
   - Implement activity feed logging
   - Implement checkpoint handling

2. **Enhance Cline Rule**
   - Add specific function calls at appropriate points
   - Refine workflow stage instructions
   - Improve checkpoint handling
   - Add context optimization

3. **Test End-to-End Workflow**
   - Verify full task lifecycle (PLAN → COMMIT)
   - Test checkpoint approvals and revisions
   - Validate activity feed logging

### Validation Criteria
- All Supabase functions work correctly
- Cline follows the complete workflow
- Checkpoints properly pause for human feedback
- Activity feed captures complete history

## Phase 3: Web Interface Development (2-3 days)

### Goals
- Create a simple web interface to interact with tasks
- Enable visualization of the knowledge graph

### Tasks
1. **Setup Web Project**
   - Initialize Next.js with shadcn/ui
   - Configure Supabase client

2. **Create Task Management Views**
   - Implement task list view
   - Implement task details with activity feed
   - Create checkpoint approval interface

3. **Add Knowledge Graph Visualization**
   - Implement project overview
   - Create pattern library view
   - Display workflow visualization

### Validation Criteria
- Web interface connects to Supabase
- Users can view and interact with tasks
- Activity feed displays in real-time
- Checkpoints can be approved through the interface

## Phase 4: Dogfooding & Evaluation (2-3 days)

### Goals
- Use the system to build itself
- Refine based on actual usage

### Tasks
1. **Setup Dogfooding Project**
   - Create a real project in Convoy
   - Define tasks for enhancing Convoy itself
   - Use the system for its own development

2. **Evaluate Effectiveness**
   - Measure AI agent effectiveness with the knowledge graph
   - Compare with baseline performance
   - Identify bottlenecks and limitations

3. **Refine Cline Rule**
   - Enhance rule based on dogfooding feedback
   - Add specialized prompts for specific scenarios
   - Optimize context retrieval strategies

### Validation Criteria
- Successfully use Convoy to enhance itself
- Document measurable improvements in AI agent performance
- Identify clear paths for future enhancement

## Prompt Engineering Principles

Throughout implementation, follow these principles:

1. **Clear Instructions**: Provide explicit, unambiguous directions
2. **Structured Workflows**: Define clear stages and transitions
3. **Context Management**: Optimize knowledge retrieval for each stage
4. **Human Oversight**: Create clear checkpoints with actionable summaries
5. **Adaptability**: Allow the AI to learn and improve from experience

## Example Rule Components

The Cline rule should include these key components:

### 1. Knowledge Graph Structure
```
## The Convoy Knowledge Graph

I rely ENTIRELY on a structured knowledge graph stored in Supabase to maintain context and follow appropriate workflows. This knowledge graph organizes:

- Workspaces as top-level containers
- Projects and their requirements
- Milestones and their target dates
- Tasks and their specifications
- Workflow stages and checkpoints
- Implementation patterns
- Best practices
- Activity history
```

### 2. Workflow Stage Instructions
```
## Workflow Stages

I navigate tasks through a structured workflow with the following stages:

### 1. PLAN Stage
- I analyze the task and create a step-by-step implementation plan
- I consider project constraints, requirements, and best practices
- I propose a clear plan with specific sub-tasks
- I record the plan in the activity feed and move to PLAN_REVIEW

### 2. PLAN_REVIEW Checkpoint
- I present the plan for human review
- I explicitly wait for approval or revision requests
- I only proceed when explicitly approved

### 3. IMPLEMENT Stage
- I execute the approved plan step by step
- I document my progress in the activity feed
- I follow project standards and best practices
- I move to VALIDATE when implementation is complete

### 4. VALIDATE Stage
- I verify the implementation through testing and validation
- I document the validation results
- I fix any issues found
- I move to CODE_REVIEW when validation is successful

### 5. CODE_REVIEW Checkpoint
- I present the implementation and validation results
- I wait for human approval or revision requests
- I only proceed when explicitly approved

### 6. COMMIT Stage
- I finalize the changes with appropriate documentation
- I generate a clear commit message
- I mark the task as completed
```

### 3. Checkpoint Handling
```
## Human Checkpoints

Checkpoints are critical points where I MUST pause and wait for human feedback. I handle checkpoints as follows:

1. When I reach a checkpoint (PLAN_REVIEW or CODE_REVIEW):
   - I generate an appropriate summary based on the checkpoint type
   - I record the checkpoint in the activity feed
   - I pause execution and explicitly wait for human approval
   - I respond to feedback by making requested changes
   - I never proceed without explicit approval

2. For PLAN_REVIEW checkpoints:
   - I present a complete implementation plan
   - I highlight key decisions and approaches
   - I note any potential challenges
   - I provide clear approve/revise options

3. For CODE_REVIEW checkpoints:
   - I summarize the changes implemented
   - I present validation results
   - I explain any deviations from the original plan
   - I provide clear approve/revise options
```

By focusing on prompt engineering rather than code implementation, we create a powerful system that leverages Cline's existing capabilities while adding the structure and oversight needed for effective AI-driven development.
