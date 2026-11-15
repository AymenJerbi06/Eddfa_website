@echo off
title EDDFA storefront - http://127.0.0.1:3001
cd /d "%~dp0"
set EDDFA_DEMO_MODE=true
echo Starting EDDFA storefront (presentation mode) on http://127.0.0.1:3001/fr
call npm run start -- --port 3001
pause
