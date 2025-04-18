# Convoy MVP

Convoy is an AI-native web application for software development, designed to orchestrate AI agents within a structured, human-supervised workflow using a Supabase-backed Knowledge Graph.

## Core Features

- **AI-Assisted Development**: Streamline software development through AI assistance
- **Knowledge Graph**: Structured project context with entities and relationships stored in Supabase
- **Memory Bank**: Central repository for documentation and project context
- **Documentation Viewer**: Access to project documentation and specifications
- **Offline Support**: Local-first approach for working without an internet connection

## Technology Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes / Server Components, Supabase (Postgres DB, Auth)
- **Data Storage**: WatermelonDB for local data, Supabase for remote
- **Documentation**: Markdown with special components for rich formatting

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (for remote data storage)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/juanbermudez/convoy-mvp.git
   cd convoy-mvp
   ```

2. Install dependencies:
   ```
   cd dashboard
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials

4. Start the development server:
   ```
   npm run dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) to see the application

## Project Structure

- `/dashboard`: Main application code
  - `/src`: Source files
    - `/features`: Feature-specific components and logic
    - `/services`: Service layer for data access
    - `/components`: Reusable UI components
    - `/hooks`: Custom React hooks
    - `/lib`: Utility functions and libraries
- `/docs`: Documentation files
- `/project-context`: Project context files for Memory Bank

## Knowledge Base Supabase Implementation

The project includes a Supabase-backed Knowledge Base documentation system:

- Database tables for storing documentation content
- Dynamic sidebar navigation based on document structure
- Markdown rendering with support for rich content
- Fallback to local data when offline

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
