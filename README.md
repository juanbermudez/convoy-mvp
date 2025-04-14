# Convoy MVP

This repository contains the Convoy AI orchestration platform, a system for enhancing AI agent capabilities through structured workflows and knowledge graphs, using prompt engineering techniques inspired by the Cline Memory Bank pattern.

## Documentation

All documentation is available in the `/docs` directory, organized in a GitBook-compatible format.

- [Main Documentation Index](docs/index.md)
- [Simplified Solution Summary](docs/simplified-solution-summary.md)
- [Convoy Workflow](docs/convoy-workflow-fixed.md)

## Key Concepts

- **Memory Bank Pattern**: A prompt engineering approach that structures context retrieval for AI agents
- **Structured Workflow**: A six-stage workflow with human checkpoints for oversight
- **Knowledge Graph**: Connects entities with their relationships for complete context retrieval
- **Supabase Integration**: Uses Supabase for data storage and retrieval

## Getting Started

### Setting up GitBook

This repository is designed to be used with GitBook. When setting up GitBook:

1. Create a new space in GitBook
2. Connect this repository to your GitBook space
3. Configure GitBook to use the `/docs` folder as the content directory

### Development

To contribute to this project:

1. Clone the repository
2. Make your changes in the `/docs` directory
3. Push your changes to GitHub
4. GitBook will automatically update with your new content

### Deploying to GitHub

Use the provided deployment script to push to GitHub:

```bash
./deploy-to-github.sh <github-username> <github-repo>
```

## License

MIT
