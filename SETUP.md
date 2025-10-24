# Quiz Generator Platform - Complete Setup Guide

## 🚀 Quick Start Guide

This guide will help you set up the Quiz Generator Platform from scratch. The platform includes a modern frontend, robust backend API, and comprehensive security features.

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ (Download from https://nodejs.org)
- **MySQL** 8.0+ (Download from https://mysql.com)
- **Git** (Download from https://git-scm.com)

### Optional but Recommended
- **PM2** for production deployment
- **MySQL Workbench** for database management
- **Postman** for API testing

## 🗄️ Database Setup

### 1. Install MySQL
```bash
# Windows: Download and run the installer from mysql.com
# macOS: brew install mysql
# Ubuntu: sudo apt-get install mysql-server
```

### 2. Create Database
```sql
-- Log in to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE quiz_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional but recommended)
CREATE USER 'quizuser'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON quiz_platform.* TO 'quizuser'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
# Run the setup script (Windows)
setup-complete.bat

# Or manually install
npm install
```

### 3. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your configuration
```

**Environment Variables (.env):**
```bash
# Database Configuration
DATABASE_URL="mysql://quizuser:your-secure-password@localhost:3306/quiz_platform"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# OpenAI Configuration (Optional)
OPENAI_API_KEY="your-openai-api-key-here"
OPENAI_MODEL="gpt-5"

# Security Configuration
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
BCRYPT_ROUNDS=12

# Logging Configuration
LOG_LEVEL="info"
```

### 4. Run Database Migrations
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

### 5. Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
# Run the installation script (Windows)
install-deps.bat

# Or manually install
npm install
```

### 3. Configure Environment Variables
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit the .env.local file
```

**Frontend Environment Variables (.env.local):**
```bash
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES="true"
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
NEXT_PUBLIC_ENABLE_SECURITY_MONITORING="true"

# UI Configuration
NEXT_PUBLIC_THEME="light"
NEXT_PUBLIC_DEFAULT_LANGUAGE="en"

# Rate Limiting
NEXT_PUBLIC_API_REQUEST_TIMEOUT="30000"
NEXT_PUBLIC_AI_REQUEST_TIMEOUT="60000"
```

### 4. Start Frontend Server
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 🧪 Testing the Installation

### 1. Access the Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Documentation**: http://localhost:3001/api/v1

### 2. Create Test Account
1. Navigate to http://localhost:3000/register
2. Create a new account with email and password
3. Verify you can log in successfully

### 3. Run System Tests
1. Navigate to http://localhost:3000/test
2. Click "Run All Tests"
3. Verify all tests pass

### 4. Test Key Features
- **Question Banks**: Create and manage question banks
- **AI Assistant**: Test AI-powered question generation (requires OpenAI API key)
- **Quiz Creation**: Create a new quiz with questions
- **Security**: Verify anti-copy protection works

## 🚀 Production Deployment

### 1. Build Applications
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd ../backend
npm run build
```

### 2. Setup PM2 (Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Start applications with PM2
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Configure Production Environment
```bash
# Set production environment variables
export NODE_ENV=production

# Configure HTTPS (recommended for production)
# Configure reverse proxy (Nginx recommended)
# Set up SSL certificates
```

### 4. Monitor Applications
```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart applications
pm2 restart all

# Stop applications
pm2 stop all
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check MySQL service status
# Windows: services.msc
# macOS/Linux: brew services list | grep mysql

# Reset MySQL password if needed
# Windows: Use MySQL Installer
# macOS/Linux: sudo mysql_secure_installation
```

#### 2. Port Conflicts
```bash
# Check what's using ports 3000 and 3001
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill processes if needed
taskkill /PID <PID> /F
```

#### 3. Node.js Version Issues
```bash
# Check Node.js version
node --version  # Should be 18+

# Use Node Version Manager (nvm) if needed
nvm install 18
nvm use 18
```

#### 4. Permission Issues
```bash
# On Windows, run as Administrator if needed
# On macOS/Linux, use sudo if needed

# Fix file permissions
chmod +x setup-complete.bat
chmod +x deploy.bat
```

#### 5. Dependencies Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### Getting Help

1. **Check Logs**: Look at console output and log files
2. **Verify Environment**: Ensure all environment variables are set correctly
3. **Test Components**: Use the test runner to isolate issues
4. **Check Database**: Verify database is running and migrations are applied

## 📚 Additional Resources

### Documentation
- [API Documentation](./docs/api-specification.md)
- [Security Implementation](./docs/security-implementation.md)
- [Architecture Guide](./docs/architecture.md)

### Development Tools
- **Database Management**: MySQL Workbench, DBeaver
- **API Testing**: Postman, Insomnia
- **Code Editor**: VS Code with recommended extensions
- **Version Control**: Git with GitHub/GitLab

### Performance Monitoring
- **Application Monitoring**: PM2 Monitoring
- **Database Monitoring**: MySQL Workbench Performance Dashboard
- **Error Tracking**: Sentry (optional)

## 🎯 Next Steps

After successful setup:

1. **Explore Features**: Test all platform features
2. **Create Content**: Add question banks and quizzes
3. **Configure AI**: Set up OpenAI API key for AI features
4. **Customize**: Modify themes and settings
5. **Deploy**: Set up production environment

## 📞 Support

If you encounter issues during setup:

1. Check the troubleshooting section above
2. Review the error messages in logs
3. Verify all prerequisites are met
4. Consult the additional documentation

---

**Setup Complete! 🎉 Your Quiz Generator Platform is ready to use!**
