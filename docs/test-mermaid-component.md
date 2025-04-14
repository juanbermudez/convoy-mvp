---
title: Mermaid Test (Component)
description: Testing Mermaid diagrams with a component-based approach
---

# Mermaid Diagram Test (Component)

This page tests Mermaid diagrams using both the standard mermaid block and a standard code block.

## Using Standard Mermaid Component

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Troubleshoot]
    D --> B
```

## Using Code Block with Mermaid Language

```mermaid
sequenceDiagram
    participant User
    participant System
    User->>System: Request data
    System->>User: Return data
    User->>System: Process data
    System->>User: Confirm processing
```

## Using Explicit Code Block Syntax

In Markdown, we can also try the explicit code block syntax:

```
graph LR
    A[Square Rect] -- Link text --> B((Circle))
    A --> C(Round Rect)
    B --> D{Rhombus}
    C --> D
