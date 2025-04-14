#!/bin/bash

# Deploy to GitHub script
# Usage: ./deploy-to-github.sh <github-username> <github-repo>

if [ "$#" -ne 2 ]; then
    echo "Usage: ./deploy-to-github.sh <github-username> <github-repo>"
    exit 1
fi

USERNAME=$1
REPO=$2
REPO_URL="https://github.com/$USERNAME/$REPO.git"

echo "Deploying to GitHub repository: $REPO_URL"

# Check if remote already exists
if git remote | grep -q "github"; then
    echo "Remote 'github' already exists, removing..."
    git remote remove github
fi

# Add GitHub as a remote
echo "Adding GitHub remote..."
git remote add github $REPO_URL

# Push to GitHub
echo "Pushing to GitHub..."
git push -u github main

echo "Deployment complete!"
echo "Your GitBook documentation is now available at: https://github.com/$USERNAME/$REPO"
echo "You can now connect this repository to GitBook.com"
echo "Make sure to point GitBook to the /docs directory"
