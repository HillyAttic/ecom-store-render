# PowerShell script to deploy to Render using GitHub and Render CLI

Write-Host "=== Deploying to Render using GitHub and Render CLI ===" -ForegroundColor Green

# Check if render.yaml exists
if (-not (Test-Path "render.yaml")) {
    Write-Host "Error: render.yaml not found" -ForegroundColor Red
    exit 1
}

# Check if git is installed
if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: git is not installed" -ForegroundColor Red
    exit 1
}

# Check if the Render CLI is installed
try {
    py -m pip show render-cli | Out-Null
    $renderCliInstalled = $true
} catch {
    $renderCliInstalled = $false
}

if (-not $renderCliInstalled) {
    Write-Host "Render CLI not found. Installing..." -ForegroundColor Yellow
    py -m pip install render-cli
}

# Ask for GitHub repository URL
Write-Host "Enter your GitHub repository URL:" -ForegroundColor Yellow
$githubRepo = Read-Host

# Git initialization if needed
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Add files to git
Write-Host "Adding files to git..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Prepare for Render deployment"

# Check if remote origin exists and update/add as needed
try {
    git remote get-url origin | Out-Null
    Write-Host "Remote already exists, updating..." -ForegroundColor Yellow
    git remote set-url origin $githubRepo
} catch {
    Write-Host "Adding remote origin..." -ForegroundColor Yellow
    git remote add origin $githubRepo
}

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main
} catch {
    Write-Host "Trying to push to master branch instead..." -ForegroundColor Yellow
    try {
        git push -u origin master
    } catch {
        Write-Host "Failed to push to GitHub. Please check your repository settings and try again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green

# Now use Render CLI to deploy
Write-Host "Attempting to use Render CLI for deployment..." -ForegroundColor Yellow

# Find render-cli location
$renderCliPath = (py -m pip show render-cli | Select-String "Location").ToString().Split(" ")[1] + "\render_cli"

# Login to Render
Write-Host "Logging in to Render (a browser window will open)..." -ForegroundColor Yellow
try {
    py -c "from render_cli.cli import main; main(['login'])"
} catch {
    Write-Host "Failed to log in to Render CLI." -ForegroundColor Red
    Write-Host "Falling back to manual deployment via Render dashboard." -ForegroundColor Yellow
    Write-Host "Please follow these steps:" -ForegroundColor Yellow
    Write-Host "1. Go to your Render dashboard: https://dashboard.render.com/"
    Write-Host "2. Navigate to 'Blueprints' and click 'New Blueprint Instance'"
    Write-Host "3. Connect your GitHub repository"
    Write-Host "4. Render will detect your render.yaml file and set up your services"
    Write-Host "5. Add your environment variables from .env.local to the Render dashboard"
    exit 0
}

# Deploy using render.yaml
Write-Host "Deploying to Render using render.yaml..." -ForegroundColor Yellow
try {
    py -c "from render_cli.cli import main; main(['deploy'])"
} catch {
    Write-Host "Error deploying with Render CLI." -ForegroundColor Red
    Write-Host "Please use the Render dashboard at https://dashboard.render.com/ to complete deployment." -ForegroundColor Yellow
}

Write-Host "Deployment process initiated!" -ForegroundColor Green
Write-Host "Check your Render dashboard for deployment status: https://dashboard.render.com/" -ForegroundColor Yellow
Write-Host "Don't forget to add environment variables from .env.local in the Render dashboard." -ForegroundColor Yellow 