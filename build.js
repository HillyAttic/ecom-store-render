const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log environment information
console.log('Node version:', process.version);
console.log('Current working directory:', process.cwd());

// Log the current directory structure
console.log('Current directory structure:');
console.log(fs.readdirSync('.'));

// Check if src directory exists
if (fs.existsSync('./src')) {
  console.log('src directory found');
  console.log(fs.readdirSync('./src'));
  
  // Check if src/app directory exists
  if (fs.existsSync('./src/app')) {
    console.log('src/app directory found');
    console.log(fs.readdirSync('./src/app'));
  } else {
    console.error('ERROR: src/app directory not found');
    process.exit(1);
  }
} else {
  console.error('ERROR: src directory not found');
  process.exit(1);
}

// Run the Next.js build command
try {
  console.log('Running Next.js build...');
  execSync('npx next build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
} 