const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to execute shell commands
function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Function to check if files exist
function checkRequiredFiles() {
  const requiredFiles = ['render.yaml', 'Dockerfile'];
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.error(`Missing required files: ${missingFiles.join(', ')}`);
    return false;
  }
  
  return true;
}

// Main deployment function
async function deployToRender() {
  console.log('Deploying to Render...');
  
  // Check required files
  if (!checkRequiredFiles()) {
    return;
  }
  
  // Get GitHub repo URL
  const getRepoUrl = () => {
    return new Promise((resolve) => {
      rl.question('Enter your GitHub repository URL: ', (url) => {
        resolve(url);
      });
    });
  };
  
  const repoUrl = await getRepoUrl();
  
  // Initialize Git if needed
  if (!fs.existsSync('.git')) {
    console.log('Initializing Git repository...');
    if (!runCommand('git init')) return;
  }
  
  // Commit changes
  console.log('Committing changes...');
  if (!runCommand('git add .')) return;
  if (!runCommand('git commit -m "Prepare for Render deployment"')) return;
  
  // Add remote if not exists
  console.log('Setting up remote repository...');
  try {
    execSync('git remote get-url origin');
    console.log('Remote already exists, updating...');
    if (!runCommand(`git remote set-url origin ${repoUrl}`)) return;
  } catch (error) {
    if (!runCommand(`git remote add origin ${repoUrl}`)) return;
  }
  
  // Push to GitHub
  console.log('Pushing to GitHub...');
  if (!runCommand('git push -u origin main')) {
    console.log('Trying to push to master branch instead...');
    if (!runCommand('git push -u origin master')) {
      console.error('Failed to push to GitHub. Please check your repository settings and try again.');
      return;
    }
  }
  
  console.log('\n\n✅ Code successfully pushed to GitHub!');
  console.log('\nNext steps:');
  console.log('1. Go to your Render dashboard: https://dashboard.render.com/');
  console.log('2. Navigate to "Blueprints" and click "New Blueprint Instance"');
  console.log('3. Connect your GitHub repository');
  console.log('4. Render will detect your render.yaml file and set up your services');
  console.log('5. Add your environment variables from .env.local to the Render dashboard');
  console.log('\nYour application will be available at the URL provided by Render once deployment is complete.');
  
  rl.close();
}

// Run the deployment function
deployToRender().catch(error => {
  console.error('Deployment failed:', error);
  rl.close();
}); 