---
title: Fixed Mermaid Test
description: Testing the fixed Mermaid diagram rendering in OpenDocs
---

# Mermaid Diagram Test (Fixed)

This page tests both the capitalized and non-capitalized versions of the Mermaid component.

## Using Capitalized Component

<Mermaid>
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Troubleshoot]
    D --> B
</Mermaid>

## Using Non-Capitalized Component

```mermaid
sequenceDiagram
    participant User
    participant System
    User->>System: Request data
    System->>User: Return data
    User->>System: Process data
    System->>User: Confirm processing
```

## Using Mermaid Code Block

```mermaid
classDiagram
    class Animal{
        +name: string
        +eat(): void
    }
    class Dog{
        +breed: string
        +bark(): void
    }
    Animal <|-- Dog
```
