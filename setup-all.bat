@echo off
REM 🚀 EaseMail - Complete Setup (Windows)
REM This script runs all setup steps in order

echo =========================================
echo 🚀 EaseMail - Complete Setup
echo =========================================
echo.

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found!
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Check if CLIs are installed
echo Checking for required CLIs...
echo.

where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Supabase CLI...
    call npm install -g supabase
)

where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    call npm install -g vercel
)

echo ✅ CLIs installed
echo.

REM Login prompts
echo =========================================
echo 🔐 Authentication Required
echo =========================================
echo.
echo Please login to each service:
echo.

echo 1. Supabase login...
call supabase login

echo.
echo 2. Vercel login...
call vercel login

echo.
echo ✅ All services authenticated
echo.

REM Run setup scripts
echo =========================================
echo 📦 Running Setup Scripts
echo =========================================
echo.

echo Step 1/3: Setting up Supabase...
echo.
call setup-supabase.bat

echo.
echo Step 2/3: Setting up GitHub...
echo.
call setup-github.bat

echo.
echo Step 3/3: Deploying to Vercel...
echo.
call setup-vercel.bat

echo.
echo =========================================
echo ✅ Complete Setup Finished!
echo =========================================
echo.
echo 🎉 Your EaseMail app is deployed!
echo.
echo 📋 Next steps:
echo   1. Add remaining API keys in Vercel dashboard
echo   2. Test the deployment
echo   3. Configure custom domain (optional)
echo.
echo 📚 See setup-instructions.md for details
echo.

pause
