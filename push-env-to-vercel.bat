@echo off
echo Pushing environment variables to Vercel...
echo.

if not exist .env.local (
    echo Error: .env.local file not found
    exit /b 1
)

echo This will set all environment variables from .env.local to Vercel
echo.
echo IMPORTANT: Make sure you're logged in to Vercel CLI:
echo   npx vercel login
echo.
echo Then link your project:
echo   npx vercel link
echo.
pause

echo.
echo Setting environment variables...
echo.

for /f "usebackq tokens=1,* delims==" %%a in (.env.local) do (
    set "key=%%a"
    set "value=%%b"

    REM Skip empty lines and comments
    if not "!key!"=="" (
        if not "!key:~0,1!"=="#" (
            echo Setting %%a...
            echo !value!| npx vercel env add %%a production
        )
    )
)

echo.
echo Done! Now redeploy your project:
echo   npx vercel --prod
echo.
pause
