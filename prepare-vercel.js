// This script prepares the project for Vercel deployment
import fs from 'fs';
import path from 'path';

// Create necessary directories
const dirs = ['dist', 'dist/api'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Copy API files to the correct location
const apiFiles = fs.readdirSync('api');
apiFiles.forEach(file => {
  const source = path.join('api', file);
  const dest = path.join('dist/api', file);
  fs.copyFileSync(source, dest);
  console.log(`Copied ${source} to ${dest}`);
});

console.log('Vercel preparation complete!');