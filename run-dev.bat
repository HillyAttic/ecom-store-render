@echo off
echo Starting Next.js development server...
cd /d "%~dp0"
set NODE_OPTIONS=--no-warnings --max-old-space-size=4096
next dev -p 3004 