---
title: Task 001 - WatermelonDB Setup and Schema Definition
description: Setting up WatermelonDB and creating schema definitions that mirror our Supabase schema
---

# Task 001: WatermelonDB Setup and Schema Definition

## Task Description
Set up WatermelonDB in the Convoy project and implement database models that mirror our existing Supabase schema, providing the foundation for the offline-first architecture.

## Implementation Details
We'll install and configure WatermelonDB, create database models for all essential entities, and ensure these models align with our Supabase schema. This includes defining relationships, indexes, and data validation rules.

## Sub-Tasks

### Sub-Task 1: Install and Configure WatermelonDB
- Description: Add WatermelonDB and related dependencies to the project
- Implementation:
  - Install WatermelonDB package
  - Configure WatermelonDB adapter
  - Set up the database connection
  - Create initialization code
  - Integrate with the application bootstrap process
- Completion Criteria: WatermelonDB is installed and initialized with the application

### Sub-Task 2: Create Core Database Models
- Description: Define WatermelonDB models for core entities
- Implementation:
  - Create model definitions for workspaces, projects, milestones, and tasks
  - Define model schema with appropriate fields and types
  - Implement model relationships
  - Add validation rules
  - Create TypeScript interfaces for model data
- Completion Criteria: Core models are defined with proper relationships

### Sub-Task 3: Create Supporting Database Models
- Description: Define WatermelonDB models for supporting entities
- Implementation:
  - Create model definitions for activity feed, task dependencies, workflows
  - Create model definitions for patterns and best practices
  - Define model schema with appropriate fields and types
  - Implement model relationships
  - Add validation rules
- Completion Criteria: Supporting models are defined with proper relationships

### Sub-Task 4: Implement Data Adapters
- Description: Create adapters to convert between Supabase and WatermelonDB data formats
- Implementation:
  - Create adapter functions for each entity type
  - Implement conversion from Supabase to WatermelonDB format
  - Implement conversion from WatermelonDB to Supabase format
  - Handle special data types (JSON, dates, etc.)
  - Write unit tests for adapters
- Completion Criteria: Data adapters correctly convert between formats

### Sub-Task 5: Create Schema Migrations Infrastructure
- Description: Implement infrastructure for handling schema migrations
- Implementation:
  - Create migration definition structure
  - Implement migration execution logic
  - Create initial schema migration
  - Document migration process
  - Test migration process
- Completion Criteria: Schema migration infrastructure is in place

## Dependencies
- Requires: PROJ-001-supabase-integration
- Blocks: Task 002 - Basic Sync Engine Implementation

## Completion Criteria
- WatermelonDB is installed and configured
- All necessary database models are defined
- Models accurately reflect the Supabase schema
- Data adapters correctly convert between formats
- Schema migration infrastructure is implemented
- Documentation is updated with model definitions
