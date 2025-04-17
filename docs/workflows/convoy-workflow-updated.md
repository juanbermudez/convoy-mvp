---
title: Convoy Workflow
description: A detailed explanation of the Convoy workflow for software development
---

# Convoy Workflow

This document explains the Convoy workflow for software development, which uses a structured hierarchy and a human-in-the-loop approach.

## Hierarchical Structure

The Convoy system uses a structured hierarchy to organize work:

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

## Workflow Stages

Every task follows a standardized workflow with specific stages:

<Mermaid>
graph LR
    A[PLAN] --> B[PLAN_REVIEW]
    B --> C[IMPLEMENT]
    C --> D[VALIDATE]
    D --> E[CODE_REVIEW]
    E --> F[COMMIT]
    
    B -.-> |Revise| A
    E -.-> |Revise| C
    
    style A fill:#f9d5e5,stroke:#333,stroke-width:2px
    style B fill:#f5d5d5,stroke:#333,stroke-width:2px
    style C fill:#d5e5f5,stroke:#333,stroke-width:2px
    style D fill:#d5f5d5,stroke:#333,stroke-width:2px
    style E fill:#f5f5d5,stroke:#333,stroke-width:2px
    style F fill:#e5d5f5,stroke:#333,stroke-width:2px
</Mermaid>

## Task Workflow Example

Here's an example of how a typical task moves through the Convoy workflow:

<Mermaid>
sequenceDiagram
    participant AI as AI Assistant
    participant Human as Human Reviewer
    
    AI->>AI: Create implementation plan
    AI->>Human: Present plan for review
    Human-->>AI: Approve or request revisions
    
    alt Plan approved
        AI->>AI: Implement according to plan
        AI->>AI: Validate implementation
        AI->>Human: Present changes for review
        Human-->>AI: Approve or request revisions
        
        alt Changes approved
            AI->>AI: Generate commit message
            AI->>Human: Request commit confirmation
            Human-->>AI: Confirm commit
        else Changes need revision
            Human->>AI: Provide feedback
            AI->>AI: Make requested changes
            AI->>Human: Present revised changes
        end
    else Plan needs revision
        Human->>AI: Provide feedback
        AI->>AI: Revise plan
        AI->>Human: Present revised plan
    end
</Mermaid>

## Task Parent-Child Relationships

Tasks can have parent-child relationships to group related work:

<Mermaid>
graph TD
    PT[Parent Task: Implement Login System] --> CT1[Child Task: Create login form UI]
    PT --> CT2[Child Task: Add form validation]
    PT --> CT3[Child Task: Implement authentication logic]
    
    style PT fill:#d5f5d5,stroke:#333,stroke-width:2px
    style CT1 fill:#f5f5d5,stroke:#333,stroke-width:2px
    style CT2 fill:#f5f5d5,stroke:#333,stroke-width:2px
    style CT3 fill:#f5f5d5,stroke:#333,stroke-width:2px
</Mermaid>

This structured workflow ensures high-quality output with appropriate human oversight at critical checkpoints.
