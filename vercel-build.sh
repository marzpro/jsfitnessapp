#!/bin/bash

# Run the standard build process first
npm run build

# Copy API files to the correct location
node -e "import('./prepare-vercel.js').catch(err => { console.error(err); process.exit(1); })"

echo "Vercel build completed successfully!"