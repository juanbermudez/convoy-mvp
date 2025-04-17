---
title: What is Convoy?
description: Introduction to the Convoy AI orchestration platform
---

# What is Convoy?

Convoy is an AI orchestration platform that enhances AI agent capabilities through structured workflows and knowledge graphs, using prompt engineering techniques inspired by the Cline Memory Bank pattern.

## Core Concept

At its core, Convoy is a prompt engineering approach to enhancing AI agent capabilities. Rather than building a complex application, Convoy leverages Cline's existing rule system to guide AI behavior while using Supabase for data storage.

The heart of Convoy is a carefully crafted Cline rule (.clinerules file) that instructs the AI agent to:

1. Follow a structured workflow with clear stages
2. Retrieve context from a knowledge graph stored in Supabase
3. Pause at checkpoints for human approval
4. Document all activities for transparency

This approach shifts the focus from coding to planning and oversight, allowing humans to guide AI development through structured checkpoints while maintaining complete visibility.

## Key Benefits

### 1. Enhanced Context Awareness

By implementing the Memory Bank pattern, Convoy enables AI agents to retrieve comprehensive context about tasks, including:

- Where the task fits in the project hierarchy
- Related tasks and dependencies
- Applicable patterns and best practices
- Recent activity and decisions

This context awareness leads to higher quality work and better decision-making.

### 2. Structured Human Oversight

Convoy's workflow includes mandatory human checkpoints at critical decision points:

- PLAN_REVIEW checkpoint ensures the implementation approach is correct before work begins
- CODE_REVIEW checkpoint verifies the implementation meets requirements before committing

This creates a balanced partnership between AI capabilities and human judgment.

### 3. Implementation Simplicity

Convoy's approach minimizes implementation complexity:

- Uses Supabase for knowledge graph storage
- Relies on prompt engineering rather than custom code
- Leverages existing Cline capabilities
- Requires minimal new infrastructure

### 4. Transparent Process

All AI activities are documented in an activity feed, creating a transparent record of:

- Planning decisions
- Implementation steps
- Validation results
- Human feedback and approvals

## Use Cases

Convoy is designed for:

- Software development projects requiring AI assistance
- Maintaining consistent development patterns across projects
- Ensuring human oversight while maximizing AI productivity
- Creating transparent, auditable AI activity records

## Why "Convoy"?

The name "Convoy" reflects the system's role in coordinating and guiding AI agents through structured workflows, similar to how a convoy guides and protects vehicles traveling together. It emphasizes the collaborative nature of the system, where AI agents and humans work together under a structured process.
