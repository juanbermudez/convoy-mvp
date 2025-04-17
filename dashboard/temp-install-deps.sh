#!/bin/bash
# Create a package.json entry to add dependencies
cat > temp-deps.json << 'EOF'
{
  "dependencies": {
    "@nozbe/watermelondb": "^0.27.1",
    "@supabase/supabase-js": "^2.39.7",
    "date-fns": "^3.3.1",
    "rxjs": "^7.8.1",
    "uuid": "^9.0.1"
  }
}
EOF

echo "Dependencies added to temporary file."
echo "To install these dependencies, run:"
echo "pnpm add @nozbe/watermelondb @supabase/supabase-js date-fns rxjs uuid"
