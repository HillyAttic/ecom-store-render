# PowerShell script to create a GitHub repository and push code

# Configuration
$repoName = "ecom-store"
$repoDescription = "E-commerce store built with Next.js"
$isPrivate = $true

# Function to create GitHub repository
function Create-GitHubRepo {
    Write-Host "Creating GitHub repository: $repoName" -ForegroundColor Green
    
    # Get GitHub credentials
    Write-Host "Please enter your GitHub username:" -ForegroundColor Yellow
    $username = Read-Host
    
    Write-Host "Please enter your GitHub personal access token (with repo scope):" -ForegroundColor Yellow
    $token = Read-Host -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
    $tokenPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    # Create auth header
    $base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(("{0}:{1}" -f $username, $tokenPlain)))
    
    # Prepare request body
    $body = @{
        name = $repoName
        description = $repoDescription
        private = $isPrivate
        auto_init = $false
    } | ConvertTo-Json
    
    try {
        # Create repository via GitHub API
        $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers @{
            Authorization = "Basic $base64AuthInfo"
            "Content-Type" = "application/json"
        } -Body $body
        
        Write-Host "Repository created successfully!" -ForegroundColor Green
        return "https://github.com/$username/$repoName.git"
    }
    catch {
        Write-Host "Error creating repository: $_" -ForegroundColor Red
        exit 1
    }
}

# Initialize Git if needed
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Create GitHub repository and get the URL
$repoUrl = Create-GitHubRepo

# Add all files to git
Write-Host "Adding files to git..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Initial commit for Render deployment"

# Add remote origin
Write-Host "Adding remote origin..." -ForegroundColor Yellow
git remote add origin $repoUrl

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main
}
catch {
    Write-Host "Trying to push to master branch instead..." -ForegroundColor Yellow
    try {
        git push -u origin master
    }
    catch {
        Write-Host "Failed to push to GitHub. Please check your repository settings and try again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Repository creation and code push completed successfully!" -ForegroundColor Green
Write-Host "Repository URL: $repoUrl" -ForegroundColor Green

# Now deploy to Render
Write-Host "Repository created and code pushed. Now let's deploy to Render." -ForegroundColor Green
Write-Host "Please go to https://dashboard.render.com/blueprints/new" -ForegroundColor Yellow
Write-Host "1. Connect your GitHub account" -ForegroundColor Yellow
Write-Host "2. Select the repository: $repoName" -ForegroundColor Yellow
Write-Host "3. Render will detect your render.yaml file and create your services" -ForegroundColor Yellow
Write-Host "4. Add your environment variables from .env.local to the Render dashboard" -ForegroundColor Yellow 