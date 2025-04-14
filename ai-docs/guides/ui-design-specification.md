# Convoy MVP UI Design Specification

## Overview

This specification details the UI views for Convoy MVP, an AI orchestration platform using a structured human-in-the-loop workflow. The design inspiration comes from Linear's interface, adapted for our AI-driven implementation using shadcn/ui components. The focus is on creating a clean, responsive, and intuitive interface that facilitates efficient human-AI collaboration.

## Design Philosophy

Convoy's UI follows these key principles:

1. **Minimalist Clarity**: Clean, uncluttered interfaces with clear visual hierarchy
2. **Contextual Focus**: UI elements adapt to highlight the current workflow stage
3. **Deliberate Interactions**: Every interaction has a clear purpose within the workflow
4. **Effortless Navigation**: Intuitive movement between different views and tasks
5. **Human-AI Collaboration**: Visual cues clearly indicate AI vs. human responsibilities

## Core UI Components

### 1. Application Shell

**Layout Structure:**
- Persistent sidebar for navigation (collapsible)
- Main content area with contextual header
- Status bar for system information and quick actions

**Implementation with shadcn:**
- Use `ResizablePanel` for collapsible sidebar
- Implement custom `AppShell` layout component
- Utilize `ScrollArea` for content overflow

### 2. Sidebar Navigation

**Design Elements:**
- Collapsible sidebar with icon and text modes
- Section dividers for logical grouping
- Visual indicators for active items
- Consistent icon design system

**Implementation with shadcn:**
- Base on Sidebar 7 design from shadcn/ui blocks
- Use `NavigationMenu` for structured navigation
- Implement `Separator` for section dividers
- `Collapsible` component for expandable sections

### 3. Project Dashboard

**Design Elements:**
- Project overview cards with status indicators
- Progress visualization with completion metrics
- Recent activity summary
- Quick action buttons for common tasks

**Implementation with shadcn:**
- `Card` components with custom `CardHeader` and `CardContent`
- `Progress` component for visualization
- Custom activity feed using `ScrollArea`
- `Button` variants for actions

### 4. Project List View

**Design Elements:**
- Sortable, filterable table of projects
- Status indicators with color coding
- Progress visualization
- Quick actions in context

**Implementation with shadcn:**
- `DataTable` with sortable columns
- Custom filtering using `Select` and `Input` components
- Status indicators with `Badge` components
- `DropdownMenu` for row actions

### 5. Task List View

**Design Elements:**
- Sortable, filterable table of tasks
- Status indicators with color coding
- Priority visualization
- Quick actions in context

**Implementation with shadcn:**
- `DataTable` with sortable columns
- Custom filtering using `Select` and `Input` components
- Status indicators with `Badge` components
- `DropdownMenu` for row actions

### 6. Task Detail View

**Design Elements:**
- Comprehensive task information
- Tabbed interface for different aspects (Details, History, Files)
- Activity timeline showing AI and human contributions
- Checkpoint indicators for workflow progression

**Implementation with shadcn:**
- Header with `Heading` and status `Badge`
- `Tabs` component for different sections
- Custom timeline using `Card` components
- `Separator` for visual organization

### 7. Activity Feed

**Design Elements:**
- Chronological display of activities
- Visual differentiation between AI and human actions
- Contextual grouping of related activities
- Interactive elements for human input

**Implementation with shadcn:**
- Custom feed using `Card` and `Avatar` components
- Color-coded indicators for AI vs. human actions
- Time indicators with relative formatting
- `Button` and `Input` components for interactions

### 8. Checkpoint Review Interface

**Design Elements:**
- Split-view comparison for code or content changes
- Clear approval/rejection actions
- Comment threads for feedback
- Visual indicators for approval status

**Implementation with shadcn:**
- Custom split view using `ResizablePanel`
- Code display with syntax highlighting
- `Textarea` for comments
- `Button` variants for approval actions

### 9. Settings View

**Design Elements:**
- Two-panel layout inspired by Tremor Dashboard settings
- Left sidebar with category navigation
- Right content area with settings forms
- Logical grouping of related settings

**Implementation with shadcn:**
- `Grid` layout with two columns
- Left sidebar using `NavigationMenu` with sections
- Right content using `Card` components for each settings section
- `Form` components with appropriate inputs
- `Separator` components for visual organization
- `Button` components for saving/applying settings

**Key Settings Categories:**
- General Settings
- API Configuration
- User Preferences
- Project Defaults
- Integrations
- Appearance

### 10. Notifications Panel

**Design Elements:**
- Dropdown or slide-in panel
- Categorized notifications
- Read/unread status indicators
- Quick actions from notifications

**Implementation with shadcn:**
- `Sheet` or `Dialog` component
- Custom notification items using `Card`
- `Badge` for unread indicators
- `Button` for actions

## UI State Management

### Loading States
- Skeleton loaders for content areas
- Progress indicators for long-running operations
- Contextual loading messages

**Implementation with shadcn:**
- `Skeleton` components for content placeholders
- `Progress` for operation status
- Custom loading overlays

### Empty States
- Helpful guidance when no content exists
- Quick actions to create initial content
- Visual illustrations for context

**Implementation with shadcn:**
- Custom empty state components
- `Button` components for actions
- Illustrations from design system

### Error States
- Clear error messaging
- Recovery options when possible
- Contextual help resources

**Implementation with shadcn:**
- `Alert` components with appropriate variants
- Custom error layouts
- `Button` components for recovery actions

## Interaction Patterns

### Human-AI Collaboration
- Clear delineation between AI suggestions and human input
- Visual indicators for AI processing
- Intuitive review and approval mechanisms

**Implementation:**
- Custom component styling for AI vs. human elements
- Animation for AI processing states
- Approval workflows with clear UI guidance

### Keyboard Navigation
- Comprehensive keyboard shortcuts
- Command palette for quick access
- Focus management for accessibility

**Implementation:**
- Global shortcut system
- `CommandDialog` for command palette
- Proper focus management in all components

### Contextual Actions
- Actions available based on current context
- Progressive disclosure of options
- Consistent action patterns across the application

**Implementation:**
- Context-aware `DropdownMenu` components
- Custom action bars
- Consistent button placement and styling

## Visual Design Elements

### Color System
- Primary brand colors with accessibility considerations
- Semantic colors for status indicators
- Light and dark mode support

**Implementation:**
- Custom theme configuration in shadcn/ui
- CSS variables for color tokens
- Dark mode using `next-themes`

### Typography
- Clear typographic hierarchy
- Consistent font usage
- Responsive sizing

**Implementation:**
- Typography scale in CSS variables
- Custom text components as needed
- Responsive typography utilities

### Iconography
- Consistent icon style
- Semantic usage for clear meaning
- Appropriate sizing and spacing

**Implementation:**
- Lucide icons for consistency
- Custom icon components when needed
- Proper sizing with typography

### Spacing and Layout
- Consistent spacing system
- Responsive layouts
- Appropriate density for different contexts

**Implementation:**
- Spacing tokens in CSS variables
- Grid and flex layouts
- Responsive breakpoints

## Animation and Transitions

### Micro-interactions
- Subtle feedback for user actions
- Loading and progress indicators
- State transitions

**Implementation:**
- CSS transitions for simple animations
- Framer Motion for complex animations
- Loading states with appropriate feedback

### Page Transitions
- Smooth transitions between views
- Context maintenance during navigation
- Loading states during transitions

**Implementation:**
- Custom transition components
- React Router with transition hooks
- Skeleton loaders during navigation

## Polish Level

The Convoy MVP UI requires a high level of polish to create a professional, intuitive experience:

1. **Visual Consistency**: All components should follow the same design language
2. **Responsive Behavior**: UI should adapt seamlessly to different window sizes
3. **Performance Optimization**: Animations and transitions should be smooth
4. **Accessibility Compliance**: All components should meet WCAG 2.1 AA standards
5. **Error Handling**: Graceful handling of errors with clear user feedback
6. **Loading States**: Appropriate loading indicators for asynchronous operations
7. **Empty States**: Helpful guidance when no content is available
8. **Documentation**: Clear component documentation for future development

## Implementation Roadmap

### Phase 1: Foundation
- Set up shadcn/ui in the project
- Implement core layout components
- Establish theme and design tokens
- Create basic navigation structure

### Phase 2: Core Views
- Implement Project Dashboard
- Build Project and Task List views
- Create Task Detail view
- Develop Activity Feed component

### Phase 3: Workflow Features
- Implement Checkpoint Review interface
- Build Notification system
- Create Settings view
- Develop Command palette

### Phase 4: Polish and Refinement
- Add animations and transitions
- Implement empty and error states
- Optimize performance
- Conduct accessibility audit and improvements

## Conclusion

This UI specification provides a comprehensive blueprint for implementing the Convoy MVP interface using shadcn/ui components. By following Linear's proven design patterns but adapting them for our AI-driven workflow, we can create an intuitive, efficient interface that facilitates human-AI collaboration in the software development process.

The emphasis on clean design, clear user flows, and appropriate visual feedback creates an environment where users can confidently work with AI assistance while maintaining oversight and control of the development process.
