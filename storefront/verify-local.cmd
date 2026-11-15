@echo off
title EDDFA checks: typecheck, tests, build
cd /d "%~dp0"
set EDDFA_DEMO_MODE=true
echo Running typecheck, tests and production build. Results in verify.log
echo === started %date% %time% > verify.log
echo === typecheck >> verify.log
call npm run typecheck >> verify.log 2>&1
echo === typecheck exit %errorlevel% >> verify.log
echo === test >> verify.log
call npm test >> verify.log 2>&1
echo === test exit %errorlevel% >> verify.log
echo === build >> verify.log
call npm run build >> verify.log 2>&1
echo === build exit %errorlevel% >> verify.log
echo === finished %date% %time% >> verify.log
echo Done. You can close this window.
timeout /t 10
