@echo off
echo ========================================
echo Deploying to Vercel
echo ========================================
echo.
echo This will deploy your project to Vercel.
echo Make sure you have the Vercel CLI installed.
echo.
echo If you don't have Vercel CLI, install it with:
echo npm install -g vercel
echo.
pause

vercel --prod

echo.
echo ========================================
echo Deployment complete!
echo ========================================
pause
