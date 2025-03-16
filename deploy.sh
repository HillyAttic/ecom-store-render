#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Deploying to Render using GitHub and Render CLI ===${NC}"

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
  echo -e "${RED}Error: render.yaml not found${NC}"
  exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
  echo -e "${RED}Error: git is not installed${NC}"
  exit 1
fi

# Check if the Render CLI is installed
if ! pip show render-cli &> /dev/null; then
  echo -e "${YELLOW}Render CLI not found. Installing...${NC}"
  pip install render-cli
fi

# Ask for GitHub repository URL
echo -e "${YELLOW}Enter your GitHub repository URL:${NC}"
read github_repo

# Git initialization if needed
if [ ! -d ".git" ]; then
  echo -e "${YELLOW}Initializing Git repository...${NC}"
  git init
fi

# Add files to git
echo -e "${YELLOW}Adding files to git...${NC}"
git add .

# Commit changes
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "Prepare for Render deployment"

# Check if remote origin exists and update/add as needed
if git remote get-url origin &> /dev/null; then
  echo -e "${YELLOW}Remote already exists, updating...${NC}"
  git remote set-url origin "$github_repo"
else
  echo -e "${YELLOW}Adding remote origin...${NC}"
  git remote add origin "$github_repo"
fi

# Push to GitHub
echo -e "${YELLOW}Pushing to GitHub...${NC}"
if ! git push -u origin main; then
  echo -e "${YELLOW}Trying to push to master branch instead...${NC}"
  if ! git push -u origin master; then
    echo -e "${RED}Failed to push to GitHub. Please check your repository settings and try again.${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}Successfully pushed to GitHub!${NC}"

# Now use Render CLI to deploy
echo -e "${YELLOW}Attempting to use Render CLI for deployment...${NC}"

# Path to render-cli
RENDER_CLI_PATH="$(python -c 'import site; print(site.USER_BASE)')/bin/render-cli"
if [ ! -f "$RENDER_CLI_PATH" ]; then
  RENDER_CLI_PATH="$(pip show render-cli | grep Location | cut -d' ' -f2)/render_cli/cli.py"
fi

# Login to Render
echo -e "${YELLOW}Logging in to Render (a browser window will open)...${NC}"
python "$RENDER_CLI_PATH" login || {
  echo -e "${RED}Failed to log in to Render CLI.${NC}"
  echo -e "${YELLOW}Falling back to manual deployment via Render dashboard.${NC}"
  echo -e "${YELLOW}Please follow these steps:${NC}"
  echo "1. Go to your Render dashboard: https://dashboard.render.com/"
  echo "2. Navigate to 'Blueprints' and click 'New Blueprint Instance'"
  echo "3. Connect your GitHub repository"
  echo "4. Render will detect your render.yaml file and set up your services"
  echo "5. Add your environment variables from .env.local to the Render dashboard"
  exit 0
}

# Deploy using render.yaml
echo -e "${YELLOW}Deploying to Render using render.yaml...${NC}"
python "$RENDER_CLI_PATH" deploy

echo -e "${GREEN}Deployment process initiated!${NC}"
echo -e "${YELLOW}Check your Render dashboard for deployment status:${NC} https://dashboard.render.com/"
echo -e "${YELLOW}Don't forget to add environment variables from .env.local in the Render dashboard.${NC}" 