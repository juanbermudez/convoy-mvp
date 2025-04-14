#!/bin/bash

# Create list of MDX files
find . -name "*.mdx" > mdx_files.txt

# Convert each file
while IFS= read -r file; do
  # Get the new filename by replacing .mdx with .md
  mdfile="${file%.mdx}.md"
  
  echo "Converting $file to $mdfile"
  
  # Read the file content
  content=$(cat "$file")
  
  # Replace <mermaid> tags with ```mermaid code blocks
  content=$(echo "$content" | sed -E 's/<mermaid>/```mermaid/g')
  content=$(echo "$content" | sed -E 's/<\/mermaid>/```/g')
  
  # Replace other MDX-specific components if needed
  # Add more sed commands here if necessary
  
  # Write the converted content to the new file
  echo "$content" > "$mdfile"
  
  # Optional: Remove the original file if needed
  # rm "$file"
done < mdx_files.txt

echo "Conversion complete!"
