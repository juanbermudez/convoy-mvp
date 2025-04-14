---
title: Convoy Workflow (Original)
description: Overview of the Convoy AI agent workflow (original version)
---

# Convoy Workflow (Uppercase Components)

This document provides an overview of the Convoy AI agent workflow, with interactive diagrams.

## Workflow Overview

The Convoy workflow follows these key stages:

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

## Workflow Stages

### 1. PLAN Stage

The AI agent analyzes the task and creates an implementation strategy.

```mermaid
flowchart LR
    Input[Task Description] --> Analyze[Analyze Requirements]
    Analyze --> Breakdown[Task Breakdown]
    Breakdown --> Dependencies[Identify Dependencies]
    Dependencies --> Strategy[Create Strategy]
    Strategy --> Output[Implementation Plan]

    style Input fill:#f9f, stroke:#333, stroke-width:1px
    style Output fill:#9e9, stroke:#333, stroke-width:1px
```

### 2. PLAN_REVIEW Checkpoint

The implementation plan is reviewed by a human.

### 3. IMPLEMENT Stage

The AI agent executes the approved plan step by step.

### 4. VALIDATE Stage

The implementation is verified against requirements.

### 5. CODE_REVIEW Checkpoint

The changes are reviewed by a human.

### 6. COMMIT Stage

The approved changes are finalized and committed.

## Hierarchical Context

```mermaid
flowchart TD
    Workspace[Workspace] --> Project[Project]
    Project --> Milestone[Milestone]
    Milestone --> Slice[Slice]
    Slice --> Task[Task]

    style Workspace fill:#bbf, stroke:#333, stroke-width:2px
    style Project fill:#bfb, stroke:#333, stroke-width:2px
    style Milestone fill:#fbf, stroke:#333, stroke-width:2px
    style Slice fill:#fbb, stroke:#333, stroke-width:2px
    style Task fill:#bff, stroke:#333, stroke-width:2px
```

## Knowledge Graph Integration

```mermaid
flowchart LR
    KG[Knowledge Graph] <-->|Informs| Plan
    KG <-->|Provides Context| Implement
    KG <-->|Updates With| Results[Task Results]

    style KG fill:#fcf, stroke:#333, stroke-width:2px
    style Results fill:#cff, stroke:#333, stroke-width:2px
