@echo off
echo Setting up Quiz Generator Platform Backend...
cd /d "D:\Project\quiz3\backend"

echo Installing dependencies...
call npm install

echo Installing additional development dependencies...
call npm install -D nodemon ts-node concurrently cross-env

echo Creating logs directory...
if not exist logs mkdir logs

echo Creating uploads directory...
if not exist uploads mkdir uploads

echo Backend setup completed!
echo.
echo Next steps:
echo 1. Configure your .env file with database and API keys
echo 2. Run: npx prisma migrate dev
echo 3. Run: npx prisma generate  
echo 4. Run: npm run dev
echo.
pause
