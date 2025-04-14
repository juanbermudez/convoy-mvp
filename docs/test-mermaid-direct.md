---
title: Mermaid Test (Direct)
description: Testing direct component usage for Mermaid diagrams
---

import { MermaidClient } from '@/components/custom/mermaid-client'

# Mermaid Diagram Test (Direct Component)

This is a test page using direct component imports to render Mermaid diagrams.

## Basic Flowchart

<MermaidClient
  id="flow1"
  chart={`
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Troubleshoot]
    D --> B
`}
/>

## Sequence Diagram

<MermaidClient
  id="seq1"
  chart={`
sequenceDiagram
    participant User
    participant System
    User->>System: Request data
    System->>User: Return data
    User->>System: Process data
    System->>User: Confirm processing
`}
/>

## Class Diagram

<MermaidClient
  id="class1"
  chart={`
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
`}
/>
