#!/bin/bash

# Make the script exit on first error
set -e

echo "Installing packages for offline-first functionality..."

# Install WatermelonDB
pnpm add @nozbe/watermelondb

# Install Supabase client
pnpm add @supabase/supabase-js

# Install utility packages
pnpm add uuid date-fns rxjs

# Install dev dependencies
pnpm add -D @types/uuid

echo "All packages successfully installed!"
