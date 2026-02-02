@echo off
REM 🚀 EaseMail - Quick Deploy to Vercel (Windows)
REM Fastest way to get your app live!

echo =========================================
echo 🚀 EaseMail - Quick Deploy
echo =========================================
echo.
echo This will deploy your app to Vercel in 2 minutes!
echo.

REM Check for Vercel CLI
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    call npm install -g vercel
    echo ✅ Vercel CLI installed
    echo.
)

REM Login to Vercel
echo 🔐 Please login to Vercel...
call vercel login

echo.
echo ✅ Logged in!
echo.

REM Check for .env.local
if not exist .env.local (
    echo Creating .env.local from example...
    copy .env.example .env.local
    echo.
    echo ⚠️  IMPORTANT: You'll need to add your API keys after deployment!
    echo.
    timeout /t 3 >nul
)

REM Deploy
echo =========================================
echo 🚀 Deploying to Vercel...
echo =========================================
echo.

call vercel --prod

echo.
echo =========================================
echo ✅ Deployment Complete!
echo =========================================
echo.
echo 🎉 Your app is live!
echo.
echo 📋 Next steps:
echo.
echo 1. Add API keys in Vercel dashboard:
echo    https://vercel.com/dashboard
echo.
echo    Required keys:
echo    - NEXT_PUBLIC_SUPABASE_URL
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo    - NYLAS_API_KEY
echo    - NYLAS_CLIENT_ID
echo    - OPENAI_API_KEY
echo    - STRIPE_SECRET_KEY
echo.
echo 2. Set up Supabase database:
echo    - Go to https://supabase.com/dashboard
echo    - Create new project
echo    - Run the SQL from: supabase/migrations/001_initial_schema.sql
echo.
echo 3. Test your app!
echo.
echo 💡 Tip: Use 'vercel env add KEY_NAME' to add env vars via CLI
echo.

pause
