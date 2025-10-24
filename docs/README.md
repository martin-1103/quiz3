# Quiz Generator Platform

**Modern SaaS Quiz Generator Platform** dengan **comprehensive Question Bank system**, **AI-powered question creation (GPT-5)**, **advanced scoring system**, dan **Anti-Copy Protection**. Built dengan **latest 2025 technology stack** untuk optimal performa dan modern user experience.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL server
- OpenAI API key (GPT-5)
- PM2 process manager

### Installation
```bash
# 1. Clone repository
git clone <your-repo>
cd quiz-platform

# 2. Setup database
mysql -u root -p
CREATE DATABASE quiz_platform;
CREATE USER 'quizuser'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON quiz_platform.* TO 'quizuser'@'localhost';

# 3. Install dependencies
npm install

# 4. Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# 5. Run database migrations
npx prisma migrate deploy
npx prisma generate

# 6. Start development servers
npm run dev
```

## 🎯 Key Features

### 📚 Question Bank System
- **Hierarchical Categories**: Subject > Topic > Subtopic dengan drag & drop
- **Smart Tagging**: Automatic dan manual tagging system
- **Advanced Search**: Full-text search dengan multiple filters
- **Import/Export**: CSV/Excel/JSON support
- **Preview Management**: Quick preview dan bulk actions

### 🤖 AI Assistant dengan GPT-5
- **Custom System Prompts**: Admin bisa define custom prompts
- **Interactive Chat**: Conversational AI untuk question creation
- **Real-time Preview**: Live preview sebelum menyimpan
- **Template System**: Pre-defined templates untuk berbagai subjects
- **Version Control**: Track perubahan dan improvements

### 🔒 Enhanced Security System
- **Anti-Copy Protection**: Mencegah copy text pada soal
- **Anti-Select Protection**: Mencegah text selection
- **Right-Click Disable**: Disable context menu
- **Print Protection**: Mencegah print quiz
- **Developer Tools Detection**: Detect dan block dev tools
- **Activity Logging**: Complete security monitoring

### 📊 Advanced Scoring System
- **Per-Option Scoring**: Setiap pilihan bisa memiliki nilai berbeda
- **Hidden Score System**: Score hanya visible di admin dashboard
- **Weighted Questions**: Different weight per question
- **AI Essay Scoring**: GPT-5 powered essay evaluation

## 🏗️ Architecture

### Project Structure
```
quiz-platform/
├── frontend/                    # Next.js 14 + shadcn/ui
├── backend/                     # Node.js + Express + Prisma
├── shared/                      # Shared types & utilities
└── docs/                        # Documentation
```

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: Node.js, Express, Prisma ORM, MySQL
- **AI**: OpenAI API (GPT-5)
- **Authentication**: JWT dengan bcryptjs
- **Deployment**: Self-hosted dengan PM2

## 📖 Documentation

### Core Documentation
- [Architecture](./architecture.md) - System architecture & design
- [Database Schema](./database-schema.md) - Complete database design
- [Features](./features.md) - Detailed feature specifications
- [API Specification](./api-specification.md) - Complete API documentation

### Implementation Guides
- [Security Implementation](./security-implementation.md) - Security & anti-copy details
- [Deployment Guide](./deployment.md) - Self-hosted deployment setup
- [Implementation Phases](./implementation-phases.md) - Development timeline

### Development Resources
- [Environment Setup](./environment-setup.md) - Development environment guide
- [Testing Strategy](./testing.md) - Testing approaches & guidelines
- [Contributing](./contributing.md) - Development contribution guide

## 🔧 Development Workflow

### Local Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Terminal 3 - Shared types (watch mode)
cd shared
npm run dev
```

### Package Scripts
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Backend
npm run dev          # Start development server
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run test         # Run tests
```

## 🚀 Deployment

### Production Deployment
```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Build backend
cd ../backend
npm run build
npx prisma migrate deploy

# 3. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend (.env)
DATABASE_URL="mysql://user:password@localhost:3306/quiz_platform"
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
```

## 📊 Success Metrics

### Technical Metrics
- **Uptime**: 99%+
- **Load Time**: <2 seconds
- **AI Accuracy**: 85%+

### Security Metrics
- **Anti-Copy Protection**: 100% effectiveness
- **Security Incidents**: Zero breaches

### User Metrics
- **User Retention**: 60%+ (3 months)
- **Completion Rate**: 90%+
- **Support Requests**: <5%

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in GitHub
- Check [Documentation](./docs/)
- Review [FAQ](./faq.md)

---

Built with ❤️ using Next.js, shadcn/ui, and modern web technologies.
