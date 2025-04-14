---
title: AI Workflow Guidelines
description: Detailed guidelines for AI agents in the Convoy system
---

# AI Workflow Guidelines

## Overview

As an AI assistant in the Convoy system, you follow a structured workflow with human oversight to complete software development tasks. This document provides detailed guidance on how to navigate each workflow stage and interact effectively with human collaborators.

## Workflow Stages

The Convoy development workflow consists of six distinct stages:

```
┌─────────┐     ┌────────────┐     ┌───────────┐     ┌──────────┐     ┌─────────────┐     ┌────────┐
│         │     │            │     │           │     │          │     │             │     │        │
│  PLAN   ├────►│ PLAN_REVIEW├────►│ IMPLEMENT ├────►│ VALIDATE ├────►│ CODE_REVIEW ├────►│ COMMIT │
│         │     │            │     │           │     │          │     │             │     │        │
└─────────┘     └────────────┘     └───────────┘     └──────────┘     └─────────────┘     └────────┘
     AI             Human              AI               AI               Human              AI
```

The `PLAN_REVIEW` and `CODE_REVIEW` stages are human checkpoints that require explicit approval before proceeding.

## Task Context and Hierarchy

When working on tasks, always understand the hierarchical context:

```
WORKSPACE (e.g., "Convoy Development")
  └── PROJECT (e.g., "Convoy MVP")
       └── MILESTONE (e.g., "Auth System v1")
            └── TASK (e.g., "Implement Authentication Flow")
                 └── SUBTASK (e.g., "Create Login Form Component")
```

Tasks can have subtasks to break down complex work into manageable units. Subtasks follow the same workflow as top-level tasks. When approaching a task, always:

1. Identify where it fits in the hierarchy
2. Understand if it's a subtask of a larger task
3. Check for related subtasks that might affect your implementation
4. Consider how this task contributes to its parent milestone

## Stage 1: PLAN

### Purpose
Create a comprehensive implementation plan that breaks down the task into clear, actionable steps.

### Instructions
1. Begin by stating you're entering the PLAN stage:
   ```
   I'll now work on the PLAN stage for this task.
   ```

2. Retrieve and state the full hierarchical context:
   ```
   ## Task Context
   - Workspace: [Workspace Name]
   - Project: [Project Name]
   - Milestone: [Milestone Name]
   - Task: [Task Name] [Parent Task Name if it's a subtask]
   ```

3. Analyze the task requirements thoroughly
   
4. Break down the implementation into 3-7 clear steps

5. For each step, provide:
   - A descriptive name
   - Detailed explanation
   - Technical approach
   - Expected outcome

6. Document potential challenges and strategies to address them

7. Format your plan using this template:
   ```markdown
   # Implementation Plan: [Task Title]

   ## Task Context
   - Workspace: [Workspace Name]
   - Project: [Project Name]
   - Milestone: [Milestone Name]
   - Task: [Task Name] [Parent Task Name if it's a subtask]

   ## Task Description
   [Full task description]

   ## Implementation Steps

   ### Step 1: [Step Name]
   [Detailed description of what will be done]
   [Technical approach and methodology]
   [Expected outcome]

   ### Step 2: [Step Name]
   [Detailed description of what will be done]
   [Technical approach and methodology]
   [Expected outcome]

   ...

   ## Potential Challenges
   - **[Challenge 1]**: [Strategy to address]
   - **[Challenge 2]**: [Strategy to address]

   ## Completion Criteria
   - [Criterion 1]
   - [Criterion 2]
   - [Criterion 3]
   ```

8. Indicate you're ready for review:
   ```
   This completes my implementation plan. I'll now await human review.
   ```

## Stage 2: PLAN_REVIEW (Human Checkpoint)

### Purpose
Pause for human review and explicit approval of your implementation plan.

### Instructions
1. Present your complete plan as created in the PLAN stage

2. Add a clear review request:
   ```markdown
   ## Review Request
   Please review this implementation plan and respond with:
   - **Approve**: To proceed with implementation
   - **Revise**: Along with specific feedback on what should be changed
   ```

3. Wait for human response:
   ```
   I'll pause here awaiting your review.
   ```

4. If approved, acknowledge and proceed:
   ```
   Thank you for approving the plan. I'll now proceed to the IMPLEMENT stage.
   ```

5. If revision is requested:
   - Thank the reviewer for feedback
   - Make requested revisions
   - Present revised plan for review again

## Stage 3: IMPLEMENT

### Purpose
Execute the approved plan step by step, writing code and making changes as outlined.

### Instructions
1. Begin by stating you're entering the IMPLEMENT stage:
   ```
   I'll now begin the IMPLEMENT stage following the approved plan.
   ```

2. Remind the human of the approved steps:
   ```
   As per the approved plan, I'll be implementing the following steps:
   1. [Step 1]
   2. [Step 2]
   ...
   ```

3. For each step:
   - Announce which step you're working on
   - Explain your approach for this specific step
   - Show the code or changes you're making
   - Test your implementation when appropriate
   - Summarize what you accomplished

4. If you need to deviate from the plan:
   - Explain why the deviation is necessary
   - Describe your alternative approach
   - Proceed with implementation

5. After completing all steps, summarize your implementation:
   ```markdown
   ## Implementation Summary
   
   I've completed all steps from the approved plan:
   
   1. **[Step 1]**: [Brief description of what was done]
   2. **[Step 2]**: [Brief description of what was done]
   ...
   
   Next, I'll move to the VALIDATE stage to verify the implementation.
   ```

## Stage 4: VALIDATE

### Purpose
Verify the implementation through testing, linting, and requirements validation.

### Instructions
1. Begin by stating you're entering the VALIDATE stage:
   ```
   I'll now begin the VALIDATE stage to verify the implementation.
   ```

2. Determine appropriate validation methods:
   - For code: Run tests, linting, type-checking
   - For documentation: Check completeness, accuracy
   - For configuration: Verify settings, test functionality

3. Perform validation and document results:
   ```markdown
   # Validation Results
   
   ## Tests
   [Test results summary]
   [Pass/fail status for each test]
   
   ## Linting
   [Linting check results]
   [Any issues found]
   
   ## Type Checking
   [Type check results]
   [Any issues found]
   
   ## Requirements Verification
   - [Requirement 1]: ✅ Met - [Explanation]
   - [Requirement 2]: ✅ Met - [Explanation]
   - [Requirement 3]: ❌ Not Met - [Explanation]
   ```

4. If issues are found:
   - Fix the issues
   - Document the fixes
   - Re-validate to confirm fixes

5. When validation is complete, prepare for review:
   ```
   Validation is complete. I'll now prepare for the CODE_REVIEW checkpoint.
   ```

## Stage 5: CODE_REVIEW (Human Checkpoint)

### Purpose
Pause for human review and explicit approval of your implementation.

### Instructions
1. Create a comprehensive summary of your implementation:
   ```markdown
   # Code Review for: [Task Title]
   
   ## Task Context
   - Workspace: [Workspace Name]
   - Project: [Project Name]
   - Milestone: [Milestone Name]
   - Task: [Task Name] [Parent Task Name if it's a subtask]
   
   ## Task Description
   [Task description]
   
   ## Changes Implemented
   - [File 1]: [Summary of changes]
   - [File 2]: [Summary of changes]
   - [Overall statistics: files changed, lines added/removed]
   
   ## Validation Results
   - **Tests**: [Pass/Fail] ([X] of [Y] tests passed)
   - **Linting**: [Pass/Fail]
   - **Type Checking**: [Pass/Fail]
   - **Requirements Met**: [Yes/No/Partial]
   
   ## Implementation Notes
   [Important implementation details]
   [Design decisions and rationale]
   [Any deviations from the original plan]
   ```

2. Add a clear review request:
   ```markdown
   ## Review Request
   Please review these changes and respond with:
   - **Approve**: To proceed with committing the changes
   - **Revise**: Along with specific feedback on what should be changed
   ```

3. Wait for human response:
   ```
   I'll pause here awaiting your review.
   ```

4. If approved, acknowledge and proceed:
   ```
   Thank you for approving the implementation. I'll now proceed to the COMMIT stage.
   ```

5. If revision is requested:
   - Thank the reviewer for feedback
   - Implement requested changes
   - Re-validate the changes
   - Present for review again

## Stage 6: COMMIT

### Purpose
Finalize the approved changes with proper documentation and commit.

### Instructions
1. Begin by stating you're entering the COMMIT stage:
   ```
   I'll now begin the COMMIT stage to finalize the changes.
   ```

2. Generate an appropriate commit message:
   ```
   [Task Type]: [Brief description]
   
   [Detailed description of the changes]
   
   Workspace: [Workspace Name]
   Project: [Project Name]
   Milestone: [Milestone Name]
   Task: [Task ID] - [Task Title]
   ```

3. Announce your intent to commit:
   ```
   I'll commit these changes with the following message:
   
   ```[Your commit message]```
   ```

4. After committing, mark the task as completed:
   ```
   The changes have been committed successfully. This task is now complete.
   ```

5. Check for related subtasks or parent task status:
   ```
   I'll now check if there are any related subtasks or if this completes a parent task.
   ```

## Communication Best Practices

When communicating during the workflow, follow these best practices:

### 1. Context Awareness
- Always reference the full hierarchical context
- Maintain awareness of related tasks and dependencies
- Apply relevant project patterns and best practices

### 2. Clear Formatting
- Use markdown formatting for readability
- Use headings, lists, and code blocks appropriately
- Structure information logically

### 3. Checkpoint Communication
- Be explicit about waiting for review
- Present clear approve/revise options
- Thank reviewers for their input
- Address all feedback points thoroughly

### 4. Progress Transparency
- Clearly announce stage transitions
- Provide progress updates during implementation
- Document any deviations from the plan
- Explain the rationale for design decisions

### 5. Code Quality
- Follow project coding standards
- Include appropriate comments
- Structure code for readability
- Use consistent naming conventions

### 6. Task Hierarchy Awareness
- Understand how subtasks relate to parent tasks
- Check for task completion up the hierarchy
- Consider how changes affect related tasks
- Document task relationships in communications

## Handling Task Hierarchies

When working with tasks and subtasks:

### For Parent Tasks

1. **Planning**: Create a high-level plan that includes coordinating subtasks
2. **Subtask Creation**: Suggest breaking down complex tasks into subtasks as needed
3. **Progress Tracking**: Track progress across all subtasks
4. **Integration**: Ensure subtask implementations work together correctly
5. **Completion**: Verify all subtasks are complete before marking the parent task done

### For Subtasks

1. **Context Awareness**: Understand how the subtask fits into the parent task
2. **Scope Management**: Stay within the subtask's defined scope
3. **Consistency**: Ensure consistency with other subtasks in the same parent
4. **Interface Alignment**: Verify your implementation works with related subtasks
5. **Reporting**: Report completion back to the parent task

By following these guidelines, you'll effectively navigate the Convoy workflow and produce high-quality work that meets both technical requirements and human expectations.
