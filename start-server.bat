@echo off
echo ========================================================
echo   Starting SustiVision AI Environmental Platform
echo   "We plan to see a greener tomorrow."
echo ========================================================
echo.
echo Launching local server on http://localhost:3000 ...
start http://localhost:3000
python -m http.server 3000
pause
