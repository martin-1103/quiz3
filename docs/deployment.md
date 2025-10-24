# Self-Hosted Deployment Guide

## Overview

Comprehensive deployment guide untuk Quiz Generator Platform dengan **self-hosted** architecture menggunakan **PM2** untuk process management, **MySQL** untuk database, dan **Nginx** untuk reverse proxy (opsional).

## System Requirements

### Minimum Requirements
- **OS**: Ubuntu 20.04+, CentOS 8+, atau Windows 10+
- **CPU**: 2 cores minimum, 4 cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB minimum SSD storage
- **Network**: Stable internet connection untuk OpenAI API

### Software Dependencies
- **Node.js**: 18.17+ (LTS recommended)
- **npm**: 9.0+ atau **pnpm**: 8.0+
- **MySQL**: 8.0+ atau **MariaDB**: 10.5+
- **PM2**: Latest version
- **Git**: Latest version

### Optional Components
- **Nginx**: 1.20+ (untuk reverse proxy dan SSL termination)
- **Redis**: 6.0+ (untuk caching dan session storage)
- **Fail2ban**: Untuk IP blocking dan security

## Server Setup

### Ubuntu/Debian Setup
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget gnupg2 software-properties-common \
  ca-certificates apt-transport-https gnupg \
  lsb-release

# Add Node.js repository
curl -fsSL https://deb.nodesource.com/setup_18.x | \
  sudo -E bash - && \
  sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install MySQL Server
sudo apt install -y mysql-server

# Install Git
sudo apt install -y git

# Verify installations
node --version  # Should be 18.17+
npm --version  # Should be 9.0+
pm2 --version
mysql --version
```

### CentOS/RHEL Setup
```bash
# Install EPEL repository
sudo yum install -y epel-release

# Add Node.js repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | \
  sudo bash -
  
# Install Node.js
sudo yum install -y nodejs npm

# Install PM2
npm install -g pm2

# Install MySQL
sudo yum install -y mysql-server

# Install Git
sudo yum install -y git

# Start services
sudo systemctl start mysqld
sudo systemctl enable mysqld
sudo systemctl start pm2
sudo systemctl enable pm2
```

## Database Setup

### MySQL Configuration
```sql
# Create database
CREATE DATABASE quiz_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create database user
CREATE USER 'quizuser'@'localhost' IDENTIFIED BY 'strong_password_123';
GRANT ALL PRIVILEGES ON quiz_platform.* TO 'quizuser'@'localhost';
FLUSH PRIVILEGES;

# Optimize for production
SET GLOBAL innodb_buffer_pool_size = 256M;
SET GLOBAL innodb_log_file_size = 256M;
SET GLOBAL innodb_flush_log_at_trx_commit = 1;
SET GLOBAL innodb_flush_method = O_DIRECT;
```

### Database Connection Testing
```bash
# Test database connection
mysql -u quizuser -p -D quiz_platform -e "SELECT 'Database connected successfully!';"
```

## Project Deployment

### 1. Clone Repository
```bash
# Clone the repository
git clone <repository-url>
cd quiz-platform

# Navigate to project directory
cd quiz-platform
```

### 2. Environment Configuration
```bash
# Create environment files
cp .env.example .env
```

#### Environment Variables
```bash
# .env - Database Configuration
DATABASE_URL="mysql://quizuser:strong_password_123@localhost:3306/quiz_platform"
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=quizuser
MYSQL_PASSWORD=strong_password_123
MYSQL_DATABASE=quiz_platform

# .env - Application Configuration
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# .env - OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-change-this-in-production
OPENAI_MODEL=gpt-5

# .env - Security
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=your-session-secret-change-this-in-production

# .env - Redis (optional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password
```

### 3. Install Dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install shared dependencies
cd ../shared
npm install

# Build shared types
npm run build
```

### 4. Database Setup
```bash
# Navigate to backend
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

### 5. Build Applications
```bash
# Build frontend
cd ../frontend
npm run build

# Build backend
cd ../backend
npm run build
```

## PM2 Configuration

### Ecosystem Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'quiz-frontend',
      script: 'npm start',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:3001',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      },
      instances: 2,
      exec_mode: 'cluster',
      max_restarts: 3,
      min_uptime: '10s',
      max_restarts: 10,
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
    {
      name: 'quiz-backend',
      script: 'npm start',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'mysql://quizuser:strong_password_123@localhost:3306/quiz_platform',
        JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
        OPENAI_API_KEY: 'sk-your-openai-api-key-change-this-in-production',
        FRONTEND_URL: 'http://localhost:3000',
        CORS_ORIGIN: 'http://localhost:3000',
      },
      instances: 2,
      exec_mode: 'cluster',
      max_restarts: 3,
      min_uptime: '10s',
      max_restarts: 10,
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
    {
      name: 'quiz-shared',
      script: 'npm run build',
      cwd: './shared',
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_restarts: 3,
    },
  ],
};
```

### Start Applications
```bash
# Start all applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Generate startup script
pm2 startup

# Monitor applications
pm2 monit
```

## Nginx Configuration (Optional)

### Install Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS/RHEL
sudo yum install epel-release
sudo yum install nginx

sudo systemctl start nginx
sudo systemctl enable nginx
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/quiz-platform
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Certificate
    ssl_certificate /etc/ssl/certs/quiz-platform.crt;
    ssl_certificate_key /etc/ssl/private/quiz-platform.key;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_cache_timeout 1d;
    ssl_session_cache_shared on;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache static files
        proxy_cache_bypass $http_upgrade;
        proxy_cache_revalidate on;
        proxy_cache_use_stale error timeout updating;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Rate limiting
        limit_req zone $binary_remote_addr zone=api_limit burst=10 nodelay;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/api/health;
    }

    # Security headers
    location ~* \.(php|jsp|cgi|asp|aspx)$ {
        deny all;
    }
}
```

## SSL Certificate Setup

### Self-Signed Certificate (Development)
```bash
# Generate private key
openssl genrsa -out key.pem 2048

# Generate certificate signing request
openssl req -new -key key.pem -out server.csr -subj "/C=US/ST=State/L=Localhost/O=Organization/CN=localhost" \
  -addext "SAN=DNS:localhost" \
  -addext "subjectAltName=DNS:localhost"

# Generate self-signed certificate
openssl x509 -req -days 365 -in server.csr -signkey key.pem -out cert.pem

# Install certificates
sudo cp cert.pem /etc/ssl/certs/quiz-platform.crt
sudo cp key.pem /etc/ssl/private/quiz-platform.key
```

### Let's Encrypt (Production)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com --non-interactive --agree-tos --redirect

# Test auto-renewal
sudo certbot renew --dry-run
```

## Monitoring & Logging

### Log Configuration
```bash
# Create log directories
mkdir -p logs/{frontend,backend,security}

# PM2 log rotation
pm2 install pm2-logrotate
```

### Monitoring Setup
```bash
# Install monitoring tools
sudo apt install htop iotop
sudo apt install nethogs

# Application monitoring
pm2 monit

# System monitoring
sudo apt install glances
```

## Backup Strategy

### Database Backups
```bash
#!/bin/bash
# backup.sh - Database Backup Script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/database"
DB_NAME="quiz_platform"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
mysqldump -u quizuser -p -h $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: backup_$DATE.sql.gz"
```

### Application Backups
```bash
#!/bin/bash
# backup-app.sh - Application Backup Script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/application"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup configuration files
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
  frontend/.env \
  backend/.env \
  shared/.env \
  ecosystem.config.js

# Backup database schema
tar -czf $BACKUP_DIR/schema_$DATE.tar.gz \
  backend/prisma/schema.prisma

# Export PM2 list
pm2 jlist > $BACKUP_DIR/pm2_list_$DATE.json

echo "Application backup completed"
```

### Cron Jobs Setup
```bash
# Add to crontab
crontab -e

# Database backup daily at 2 AM
0 2 * * * /path/to/backup.sh

# Application backup weekly on Sunday at 1 AM
0 1 * * 0 /path/to/backup-app.sh

# PM2 restart weekly
0 3 * * 0 /usr/local/bin/pm2 restart all

# Clean old backups monthly
0 4 1 * * /usr/bin/find /backups -mtime +30 -delete
```

## Performance Optimization

### Database Optimization
```sql
-- Enable query cache
SET GLOBAL query_cache_size = 67108864;
SET GLOBAL query_cache_type = ON;
SET GLOBAL query_cache_limit = 1;

-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
SET GLOBAL slow_query_log_file = '/var/log/mysql/mysql-slow.log';

-- Performance schema optimizations
ALTER TABLE questions ADD INDEX idx_type_difficulty (type, difficulty);
ALTER TABLE quiz_sessions ADD INDEX idx_quiz_created (quizId, createdAt);
ALTER TABLE security_logs ADD INDEX idx_severity_timestamp (severity, timestamp);
```

### Application Optimization
```bash
# Enable gzip compression in Nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
  text/plain
  text/css
  text/xml
  text/javascript
  application/json
  application/javascript
  application/xml+rss
  application/atom+xml
  image/svg+xml;
```

## Security Hardening

### Firewall Configuration
```bash
# Install UFW (Ubuntu)
sudo ufw enable
sudo ufw default deny
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp

# Install Fail2ban
sudo apt install fail2ban

# Configure Fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.conf.local

# Add custom jail for API abuse
[api-abuse]
enabled = true
filter = apache-noscript
action = iptables-multiport
port = http,https
maxretry = 3
findtime = 600
bantime = 3600
logpath = /var/log/apache2/access.log
maxretry = 3
findtime = 600
bantime = 3600
```

### Security Headers
```javascript
// Add to security middleware
const securityHeaders = {
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://api.openai.com",
  ],
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  xXssProtection: '1; mode=block',
  referrerPolicy: 'strict-origin-origin-when-cross-origin',
  permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
};
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check MySQL status
sudo systemctl status mysql

# Check MySQL logs
sudo journalctl -u mysql -f

# Restart MySQL if needed
sudo systemctl restart mysql
```

#### 2. Port Already in Use
```bash
# Check which process is using the port
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3001

# Kill process if needed
sudo kill -9 <PID>

# Find and stop PM2 processes
pm2 list
pm2 stop <process-name>
```

#### 3. Memory Issues
```bash
# Check memory usage
free -h
htop

# Restart PM2 processes
pm2 restart all

# Check system logs
sudo journalctl -xe
```

#### 4. SSL Certificate Issues
```bash
# Check certificate expiration
openssl x509 -in /etc/ssl/certs/quiz-platform.crt -noout -dates

# Test SSL configuration
openssl s_client -connect your-domain.com:443
```

### Health Checks
```bash
# Check application status
curl http://localhost:3001/api/health

# Check database connection
curl -X POST http://localhost:3001/api/test-db

# Check PM2 status
pm2 status
pm2 logs
```

## Maintenance

### Regular Maintenance Tasks
```bash
# Weekly maintenance script
#!/bin/bash

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
npm update

# Restart PM2 processes
pm2 restart all

# Clean up logs
find logs/ -name "*.log" -mtime +30 -delete

# Run database optimization
mysql -u root -e "OPTIMIZE TABLE questions; OPTIMIZE TABLE quiz_sessions;"

# Backup database
/path/to/backup.sh

echo "Maintenance completed"
```

This comprehensive deployment guide provides everything needed to successfully deploy and maintain the Quiz Generator Platform in a self-hosted environment with proper security, monitoring, and performance optimization.
