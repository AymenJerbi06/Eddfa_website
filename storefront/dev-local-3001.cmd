@echo off
title EDDFA storefront (live preview) - http://127.0.0.1:3001
cd /d "%~dp0"
set EDDFA_DEMO_MODE=true
echo EDDFA storefront, presentation mode, with live reload.
echo Open http://127.0.0.1:3001/fr  -  close this window to stop the preview.
echo Server log: dev-3001.log
call npm run dev -- --port 3001 > dev-3001.log 2>&1
pause
