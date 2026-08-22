@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "Travel Claims Manager" http://localhost:8765/index.html
  py -m http.server 8765
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "Travel Claims Manager" http://localhost:8765/index.html
  python -m http.server 8765
  goto :eof
)
echo Python was not found. You can either install Python or open index.html directly and import an ICS file instead of using an ICS URL.
pause
