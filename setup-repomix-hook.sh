#!/bin/bash
# Script to set up a Git hook that updates the Repomix codebase export after commits

echo "Setting up Git post-commit hook for Repomix updates..."

# Ensure the .git/hooks directory exists
if [ ! -d ".git/hooks" ]; then
  echo "Error: .git/hooks directory not found. Are you in a Git repository?"
  exit 1
fi

# Create the post-commit hook
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash
# Git post-commit hook to update Repomix codebase export

echo "Updating Repomix codebase export after commit..."

# Path to the update script, relative to repository root
UPDATE_SCRIPT="./update-repomix.sh"

# Get the repository root directory
REPO_ROOT=$(git rev-parse --show-toplevel)

# Change to the repository root
cd "$REPO_ROOT" || exit 1

# Check if the update script exists and is executable
if [ -x "$UPDATE_SCRIPT" ]; then
  # Run the update script
  $UPDATE_SCRIPT
else
  echo "Warning: Repomix update script not found or not executable at $UPDATE_SCRIPT"
  echo "You may need to run it manually with: ./update-repomix.sh"
fi
EOF

# Make the hook executable
chmod +x .git/hooks/post-commit

echo "Git post-commit hook installed successfully!"
echo "Now, whenever you make a commit, the Repomix codebase export will be automatically updated."
echo "You can still manually update at any time by running: ./update-repomix.sh"
