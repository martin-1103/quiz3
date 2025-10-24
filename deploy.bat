@echo off
echo ========================================
echo Quiz Generator Platform Deployment
echo ========================================
echo.

echo Step 1: Building Frontend...
cd /d "D:\Project\quiz3\frontend"
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)
echo Frontend build completed successfully!
echo.

echo Step 2: Building Backend...
cd /d "D:\Project\quiz3\backend"
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Backend build failed!
    pause
    exit /b 1
)
echo Backend build completed successfully!
echo.

echo Step 3: Running Database Migrations...
call npx prisma migrate deploy
if %ERRORLEVEL% neq 0 (
    echo Database migration failed!
    pause
    exit /b 1
)
echo Database migrations completed successfully!
echo.

echo Step 4: Starting Applications with PM2...
cd /d "D:\Project\quiz3"
pm2 start ecosystem.config.js
pm2 save
pm2 startup
echo.

echo Step 5: Verifying Deployment...
timeout /t 5
pm2 status
echo.

echo ========================================
echo Deployment Completed Successfully!
echo ========================================
echo.
echo Applications are running:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:3001
echo - Health Check: http://localhost:3001/health
echo.
echo PM2 Commands:
echo - pm2 status     (View status)
echo - pm2 logs       (View logs)
echo - pm2 restart    (Restart apps)
echo - pm2 stop       (Stop apps)
echo - pm2 delete     (Remove apps)
echo.
pause
