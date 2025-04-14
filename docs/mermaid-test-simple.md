---
title: Simple Mermaid Test
description: A simple test of Mermaid diagrams using directly rendered divs
---

# Simple Mermaid Test

This page demonstrates the simplest approach to Mermaid diagrams in MDX.

## Basic Diagram

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Troubleshoot]
    D --> B

    style A fill:#bfb, stroke:#333, stroke-width:2px
    style B fill:#bbf, stroke:#333, stroke-width:2px
    style C fill:#fbf, stroke:#333, stroke-width:2px
    style D fill:#fbb, stroke:#333, stroke-width:2px
```

## Workflow Diagram

```mermaid
flowchart TD
    Start([Start]) --> Plan[PLAN]
    Plan --> PlanReview[PLAN_REVIEW]
    PlanReview --> Implement[IMPLEMENT]
    Implement --> Validate[VALIDATE]
    Validate --> CodeReview[CODE_REVIEW]
    CodeReview --> Commit[COMMIT]
    Commit --> End([End])

    style Plan fill:#9ee, stroke:#333, stroke-width:2px
    style PlanReview fill:#f96, stroke:#333, stroke-width:2px
    style Implement fill:#9e6, stroke:#333, stroke-width:2px
    style Validate fill:#f9c, stroke:#333, stroke-width:2px
    style CodeReview fill:#f96, stroke:#333, stroke-width:2px
    style Commit fill:#c9e, stroke:#333, stroke-width:2px
```

## Simple Class Diagram

```mermaid
classDiagram
    class Convoy
    class Agent
    class Task

    Convoy o-- Agent: manages
    Agent --> Task: works_on
