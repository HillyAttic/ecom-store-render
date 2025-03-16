@echo off
echo Building Next.js app...
cd /d "%~dp0"
set NODE_OPTIONS=--no-warnings --max-old-space-size=4096
set NEXT_TELEMETRY_DISABLED=1
next build 