# Quiz Generator Platform

A modern SaaS Quiz Generator Platform with comprehensive Question Bank system, AI-powered question creation (GPT-5), advanced scoring system, and Anti-Copy Protection. Built with the latest 2025 technology stack for optimal performance and modern user experience.

## 🏗️ Architecture

This project uses a frontend-backend separated architecture:

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Prisma ORM + MySQL
- **AI Integration**: OpenAI GPT-5 API
- **Authentication**: JWT with refresh tokens
- **Security**: Multiple layers of protection including anti-copy measures

## 📁 Project Structure

```
quiz3/
├── frontend/              # Next.js 15 frontend application
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and configurations
│   │   ├── hooks/        # Custom React hooks
│   │   ├── store/        # State management
│   │   └── types/        # TypeScript type definitions
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
├── backend/               # Express.js backend API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Custom middleware
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   └── types/        # TypeScript types
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── migrations/   # Database migrations
│   └── package.json
├── shared/               # Shared types and utilities
│   └── types/
│       └── index.ts     # Shared TypeScript types
└── docs/                # Project documentation
    ├── README.md
    ├── features.md
    ├── architecture.md
    ├── database-schema.md
    ├── api-specification.md
    ├── security-implementation.md
    ├── deployment.md
    └── implementation-phases.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL server
- OpenAI API key (for GPT-5 integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo>
   cd quiz3
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database and API configurations
   npx prisma migrate dev
   npx prisma generate
   npm run dev
   ```

3. **Setup the Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your API URL
   npm run dev
   ```

4. **Access the Applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/v1

## 🔧 Environment Configuration

### Backend (.env)

```bash
# Database
DATABASE_URL="mysql://username:password@localhost:3306/quiz_platform"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Server
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🎯 Key Features

### 📚 Question Bank System
- Hierarchical categories (Subject > Topic > Subtopic)
- Advanced search and filtering
- Tag management system
- Import/Export functionality
- Bulk operations

### 🤖 AI Assistant with GPT-5
- Custom system prompts
- Interactive chat interface
- Question generation with preview
- AI essay scoring
- Template management

### 🔒 Enhanced Security System
- Anti-copy protection
- Anti-select protection
- Right-click disable
- Print protection
- Developer tools detection
- Activity logging

### 📊 Advanced Scoring System
- Per-option scoring
- Hidden score system
- Weighted questions
- AI-powered essay evaluation

### 📈 Analytics Dashboard
- Quiz performance metrics
- User engagement analytics
- Security event monitoring
- AI usage statistics

## 🔐 Security Features

- **Multi-layer Authentication**: JWT with refresh tokens
- **Anti-Copy Protection**: Prevents text selection and copying
- **Security Monitoring**: Real-time threat detection
- **Input Validation**: Comprehensive validation with Zod
- **Rate Limiting**: API rate limiting for all endpoints
- **CORS Protection**: Secure cross-origin resource sharing

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get user profile

### Question Management

- `GET /api/v1/questions` - Get questions with filtering
- `POST /api/v1/questions` - Create new question
- `PUT /api/v1/questions/:id` - Update question
- `DELETE /api/v1/questions/:id` - Delete question

### Quiz Management

- `GET /api/v1/quizzes` - Get quizzes
- `POST /api/v1/quizzes` - Create quiz
- `POST /api/v1/quizzes/:id/start` - Start quiz session
- `POST /api/v1/quizzes/sessions/:token/complete` - Complete quiz

### AI Integration

- `POST /api/v1/ai/chat` - AI chat interface
- `POST /api/v1/ai/generate-questions` - Generate questions
- `POST /api/v1/ai/score-essay` - Score essays with AI

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Production Build

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### Using PM2 for Process Management

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start ecosystem.config.js

# Start frontend
cd frontend
pm2 start ecosystem.config.js
```

## 📊 Success Metrics

- **Uptime**: 99%+
- **Load Time**: <2 seconds
- **AI Accuracy**: 85%+
- **Security Events**: Zero breaches
- **User Retention**: 60%+ (3 months)

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
- Check the [Documentation](./docs/)
- Review the [FAQ](./docs/faq.md)

---

Built with ❤️ using Next.js 15, Express.js, and modern web technologies.
