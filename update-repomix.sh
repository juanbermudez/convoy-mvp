#!/bin/bash
# Script to update the Repomix codebase export
# This ensures AI agents always have access to the latest code state

echo "Starting Convoy Project Repomix update process..."

# Ensure .repomix directory exists
mkdir -p .repomix

# Get current timestamp for file versioning
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
OUTPUT_FILE=".repomix/convoy-codebase.xml"
VERSIONED_FILE=".repomix/convoy-codebase-${TIMESTAMP}.xml"

# Run repomix to generate latest codebase export
echo "Generating fresh codebase export..."
repomix --output $OUTPUT_FILE

# Only create a versioned file if the main export was successful
if [ -f "$OUTPUT_FILE" ]; then
  # Also save a versioned copy
  cp $OUTPUT_FILE $VERSIONED_FILE
  
  # Create a symlink to the latest version
  ln -sf $VERSIONED_FILE .repomix/latest.xml
  
  # Calculate stats
  FILE_SIZE=$(du -h $OUTPUT_FILE | cut -f1)
  TOKEN_COUNT=$(grep -o "Total Tokens:" $OUTPUT_FILE | tail -1 | awk '{print $3}')
  
  echo "Repomix export completed successfully!"
  echo "Output file: $OUTPUT_FILE"
  echo "Versioned copy: $VERSIONED_FILE"
  echo "File size: $FILE_SIZE"
  echo "Token count: $TOKEN_COUNT"
  
  # Cleanup old exports (keep last 5)
  echo "Cleaning up old exports..."
  ls -t .repomix/convoy-codebase-*.xml | tail -n +6 | xargs -I{} rm {} 2>/dev/null
  
  echo "Repomix update complete. AI agents now have access to the latest codebase representation."
else
  echo "Error: Repomix export failed. Please check for errors."
  exit 1
fi
