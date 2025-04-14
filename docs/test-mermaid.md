---
title: Mermaid Test (Updated)
description: Testing Mermaid diagrams in OpenDocs (updated version)
---

# Mermaid Diagram Test (Updated)

This is an updated test page for Mermaid diagrams using code blocks.

## Basic Flowchart Example

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

## Sequence Diagram Example

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant System

    User->>System: Request data
    System->>User: Return data
    User->>System: Process data
    System->>User: Confirm processing

    Note over User,System: Basic interaction flow
```

## State Diagram Example

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Error: Fail
    Success --> [*]
    Error --> Idle: Retry

    state Processing {
        [*] --> ValidatingInput
        ValidatingInput --> ProcessingData: Valid
        ProcessingData --> GeneratingOutput
        GeneratingOutput --> [*]
    }
```

## Entity Relationship Diagram

```mermaid
erDiagram
    WORKSPACE ||--o{ PROJECT : contains
    PROJECT ||--o{ MILESTONE : has
    MILESTONE ||--o{ SLICE : includes
    SLICE ||--o{ TASK : consists_of
    TASK }|--|| AGENT : assigned_to
```

## Class Diagram Example

```mermaid
classDiagram
    class Convoy {
        +name: string
        +version: number
        +init(): void
        +run(): void
    }

    class Agent {
        +id: string
        +skills: string[]
        +completeTask(task: Task): void
    }

    class Task {
        +id: string
        +status: TaskStatus
        +start(): void
        +complete(): void
    }

    Convoy o-- Agent: manages
    Agent --> Task: works_on
