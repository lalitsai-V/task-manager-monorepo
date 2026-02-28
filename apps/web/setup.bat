@echo off
REM TaskFlow Quick Setup Script for Windows
REM Run this after cloning the repo to set up the project

echo.
echo 🚀 TaskFlow Setup Starting...
echo.

REM Check Node version
echo ✓ Checking Node.js version...
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo   Node version: %NODE_VERSION%
echo.

REM Install dependencies
echo ✓ Installing dependencies...
call npm install
echo.

REM Create .env.local
echo ✓ Setting up environment file...
if not exist .env.local (
  copy .env.local.example .env.local
  echo   Created .env.local - update with your Supabase credentials
) else (
  echo   .env.local already exists - skipping
)
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📋 NEXT STEPS:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1️⃣  Create Supabase Project:
echo    - Go to https://supabase.com
echo    - Create a new project
echo    - Get API credentials from Settings ^> API
echo.
echo 2️⃣  Set Up Database:
echo    - Open database.sql file
echo    - Go to Supabase SQL Editor
echo    - Copy and paste the entire SQL content
echo    - Execute the queries
echo.
echo 3️⃣  Configure Environment:
echo    - Edit .env.local
echo    - Add your Supabase credentials:
echo      NEXT_PUBLIC_SUPABASE_URL=your_url
echo      NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
echo      SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
echo.
echo 4️⃣  Start Development Server:
echo    npm run dev
echo.
echo 5️⃣  Open in Browser:
echo    http://localhost:3000
echo.
echo ✨ For detailed setup, see SETUP.md
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
