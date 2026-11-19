@echo off
cd /d "%~dp0"
set "NODE_EXE=C:\Program Files\WindowsApps\OpenAI.CodexPrimaryRuntime.v26-1118-904-0_26.1118.904.0_x64__3k8sg7r9htsxt\dependencies\node\bin\node.exe"
if not exist "%NODE_EXE%" (
  where node >nul 2>nul
  if errorlevel 1 (
    echo Node.js could not be found. Install Node.js or update NODE_EXE in this file.
    pause
    exit /b 1
  )
  set "NODE_EXE=node"
)
echo Starting the Gemini Assistant local server...
"%NODE_EXE%" server.js
if errorlevel 1 pause

