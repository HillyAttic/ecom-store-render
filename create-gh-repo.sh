#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="ecom-store"
REPO_DESCRIPTION="E-commerce store built with Next.js"
IS_PRIVATE=true

echo -e "${GREEN}=== Creating GitHub Repository and Deploying to Render ===${NC}"

# Function to create GitHub repository
create_github_repo() {
  echo -e "${YELLOW}Please enter your GitHub username:${NC}"
  read username
  
  echo -e "${YELLOW}Please enter your GitHub personal access token (with repo scope):${NC}"
  read -s token
  
  echo -e "${YELLOW}Creating GitHub repository: $REPO_NAME${NC}"
  
  # Prepare request body
  request_body="{\"name\":\"$REPO_NAME\",\"description\":\"$REPO_DESCRIPTION\",\"private\":$IS_PRIVATE,\"auto_init\":false}"
  
  # Create repository via GitHub API
  response=$(curl -s -X POST \
    -H "Authorization: token $token" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "$request_body" \
    https://api.github.com/user/repos)
  
  # Check if repository was created successfully
  if echo "$response" | grep -q "\"name\":\"$REPO_NAME\""; then
    echo -e "${GREEN}Repository created successfully!${NC}"
    echo "https://github.com/$username/$REPO_NAME.git"
  else
    echo -e "${RED}Error creating repository:${NC}"
    echo "$response"
    exit 1
  fi
}

# Initialize Git if needed
if [ ! -d ".git" ]; then
  echo -e "${YELLOW}Initializing Git repository...${NC}"
  git init
fi

# Create GitHub repository and get the URL
repo_url=$(create_github_repo)

# Add all files to git
echo -e "${YELLOW}Adding files to git...${NC}"
git add .

# Commit changes
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "Initial commit for Render deployment"

# Add remote origin
echo -e "${YELLOW}Adding remote origin...${NC}"
git remote add origin "$repo_url"

# Push to GitHub
echo -e "${YELLOW}Pushing to GitHub...${NC}"
if ! git push -u origin main; then
  echo -e "${YELLOW}Trying to push to master branch instead...${NC}"
  if ! git push -u origin master; then
    echo -e "${RED}Failed to push to GitHub. Please check your repository settings and try again.${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}Repository creation and code push completed successfully!${NC}"
echo -e "${GREEN}Repository URL: $repo_url${NC}"

# Now deploy to Render
echo -e "${GREEN}Repository created and code pushed. Now let's deploy to Render.${NC}"
echo -e "${YELLOW}Please go to https://dashboard.render.com/blueprints/new${NC}"
echo -e "${YELLOW}1. Connect your GitHub account${NC}"
echo -e "${YELLOW}2. Select the repository: $REPO_NAME${NC}"
echo -e "${YELLOW}3. Render will detect your render.yaml file and create your services${NC}"
echo -e "${YELLOW}4. Add your environment variables from .env.local to the Render dashboard${NC}" 