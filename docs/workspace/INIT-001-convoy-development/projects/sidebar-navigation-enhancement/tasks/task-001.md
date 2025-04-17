---
title: Workbench Section Modification
description: Rename "General" to "Workbench" and modify menu items
status: to-do
---

# Task: Workbench Section Modification

## Memory Bank Context
- Workspace: INIT-001-convoy-development
- Project: Sidebar Navigation Enhancement
- Task: Modify Workbench section

## Task Description
Rename the "General" section in the sidebar to "Workbench" and modify the menu items to focus on active work elements. Hide Apps, Chats, and Users items while preserving them in the code.

## Implementation Steps

1. Modify `sidebar-data.ts` to:
   - Change the title from "General" to "Workbench"
   - Preserve Dashboard, Projects, and Tasks
   - Add placeholder items for Roadmap and Activity
   - Hide Apps, Chats, and Users (but keep in code)

2. Use appropriate icons for all menu items to maintain visual consistency

## Technical Approach
- Add a `hidden` property to menu items that should not be displayed
- Filter out hidden items in the sidebar component rendering
- Use consistent naming conventions and icons for new items

## Completion Criteria
- "General" section is renamed to "Workbench"
- Dashboard, Projects, Tasks, Roadmap, and Activity are visible
- Apps, Chats, and Users are hidden but preserved in code
- Icons are consistent with the design language
