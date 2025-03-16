# Deploying to Render

This guide explains how to deploy your Next.js ecommerce application to Render.

## Prerequisites

1. A [Render account](https://render.com/)
2. Your code pushed to a GitHub repository

## Deployment Steps

### Option 1: Using the Web Dashboard

1. Log in to your Render account
2. Click on "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service with these settings:
   - **Name**: ecom-store (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Select an appropriate plan (Free tier available for testing)
5. Under "Advanced" settings, add the following environment variables:
   - Copy all variables from your `.env.local` file
   - Set `NODE_ENV` to `production`
6. Click "Create Web Service"

### Option 2: Using render.yaml (Blueprint)

1. We've added a `render.yaml` file to your repository
2. Go to https://dashboard.render.com/blueprints
3. Click "New Blueprint Instance"
4. Connect your repository
5. Render will automatically detect the `render.yaml` file and create the services
6. Add your environment variables from `.env.local` in the configuration step

### Option 3: Using GitHub and Render API

Since Render CLI might have compatibility issues on some systems, here's a more reliable approach:

1. Push your code (including render.yaml) to a GitHub repository:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Use Render's GitHub integration:
   - Log in to your Render dashboard
   - Navigate to "Blueprints" from the sidebar
   - Click "New Blueprint Instance"
   - Select your GitHub repository
   - Render will read your render.yaml file and set up your services automatically

3. Environment Variables:
   After deployment, go to the service dashboard and add all environment variables from your `.env.local` file.

### Option 4: Using Deployment Scripts

We've created two deployment scripts that automate the process of pushing to GitHub and deploying to Render using the Render CLI:

#### For Windows (PowerShell):
```
./deploy.ps1
```

#### For macOS/Linux (Bash):
```
chmod +x deploy.sh
./deploy.sh
```

These scripts will:
1. Check if all required files exist
2. Initialize Git if needed
3. Commit your changes
4. Push to GitHub
5. Attempt to use the Render CLI for deployment
6. Fall back to manual dashboard deployment if needed

### Environment Variables

Ensure all environment variables from your `.env.local` file are added to your Render service.

## After Deployment

1. Your application will be available at the URL provided by Render
2. Check the logs for any issues
3. Set up a custom domain in the Render dashboard if needed

## Troubleshooting

- If you encounter build errors, check Render logs for details
- Make sure all required environment variables are properly set
- If using Firebase, ensure the Firebase configuration is properly set up for production 