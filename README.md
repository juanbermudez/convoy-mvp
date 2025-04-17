# Convoy MVP

An AI-assisted development platform designed to help teams build better software through enhanced human-AI collaboration.

## Project Structure

- **app/** - Electron-based desktop application
- **dashboard/** - Web dashboard interface built with React
- **docs/** - Project documentation and guidelines
- **supabase/** - Database migrations and schema

## Getting Started

To start the Convoy dashboard:

```bash
./start-convoy-dashboard.sh
```

## Development Tools

### Repomix Integration

This project uses [Repomix](https://github.com/yamadashy/repomix) to provide AI-friendly representations of the codebase. This helps AI assistants (like Claude, ChatGPT, etc.) better understand the project structure and provide more accurate assistance.

#### Setup

1. Install Repomix globally:

```bash
npm install -g repomix
```

2. Generate the codebase representation:

```bash
./update-repomix.sh
```

3. Set up the Git hook for automatic updates (optional):

```bash
./setup-repomix-hook.sh
```

#### Using Repomix with AI Assistants

When working with AI assistants on complex tasks, you can direct them to the Repomix output:

```
Please look at the codebase context in .repomix/convoy-codebase.xml to help me with [task description]
```

For more details, see the [Repomix documentation](.repomix/README.md).

## Memory Bank System

Convoy uses a Memory Bank system to maintain context between AI interactions. This system follows a strict hierarchy and workflow pattern. For more details, see the Memory Bank documentation in the docs/core-concepts directory.

## Contributing

When contributing to this project, please adhere to the workflow guidelines outlined in the documentation.

## License

[License information goes here]
