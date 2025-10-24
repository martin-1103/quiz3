# API Specification

## Overview

Complete RESTful API documentation untuk Quiz Generator Platform dengan comprehensive security, AI integration, dan performa optimization.

## Base URL Structure

```
https://api.quiz-platform.com/api/v1
```

## Authentication API

### POST /api/auth/login
```typescript
// Request
interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

// Response
interface LoginResponse {
  success: boolean;
  user?: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}
```

### POST /api/auth/register
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface RegisterResponse {
  success: boolean;
  user?: User;
  message: string;
}
```

### POST /api/auth/refresh
```typescript
interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  success: boolean;
  token: string;
  expiresAt: string;
}
```

## Question Bank APIs

### GET /api/questions
```typescript
interface GetQuestionsQuery {
  questionBankId?: string;
  categoryId?: string;
  search?: string;
  type?: QuestionType;
  difficulty?: Difficulty;
  tags?: string[];
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface GetQuestionsResponse {
  success: boolean;
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total: number;
}
```

### POST /api/questions
```typescript
interface CreateQuestionRequest {
  questionBankId?: string;
  categoryId?: string;
  type: QuestionType;
  questionText: string;
  idealAnswer?: string;
  timeLimit?: number;
  maxPoints: number;
  difficulty: Difficulty;
  tags?: string[];
  options: OptionData[];
}

interface OptionData {
  optionText: string;
  points: number;
  isCorrect: boolean;
  order: number;
  explanation?: string;
}

interface CreateQuestionResponse {
  success: boolean;
  question: Question;
}
```

### PUT /api/questions/:id
```typescript
interface UpdateQuestionRequest {
  questionText: string;
  idealAnswer?: string;
  timeLimit?: number;
  maxPoints: number;
  difficulty: Difficulty;
  tags?: string[];
  options: OptionData[];
}
```

### DELETE /api/questions/:id
```
interface DeleteQuestionResponse {
  success: boolean;
  message: string;
}
```

### GET /api/questions/search
```typescript
interface SearchQuestionsRequest {
  query: string;
  filters: {
    type?: QuestionType[];
    difficulty?: Difficulty[];
    tags?: string[];
    categoryId?: string;
    questionBankId?: string;
    isPublic?: boolean;
  };
}
```

## Category Management APIs

### GET /api/categories
```typescript
interface GetCategoriesQuery {
  parentId?: string;
  includeQuestionCount?: boolean;
  level?: number;
}

interface GetCategoriesResponse {
  success: boolean;
  categories: CategoryWithQuestionCount[];
}
```

### POST /api/categories
```typescript
interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  color?: string;
  icon?: string;
}
```

## Quiz Management APIs

### GET /api/quizzes
```typescript
interface GetQuizzesQuery {
  search?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}
```

### POST /api/quizzes
```typescript
interface CreateQuizRequest {
  title: string;
  description?: string;
  questionGroupIds?: string[];
  questionIds?: string[];
  timeLimit?: number;
  enableAntiCopy?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  maxAttempts?: number;
}
```

### GET /api/quizzes/:id
```typescript
interface GetQuizResponse {
  success: boolean;
  quiz: Quiz;
}
```

### PUT /api/quizzes/:id
```typescript
interface UpdateQuizRequest {
  title?: string;
  description?: string;
  timeLimit?: number;
  enableAntiCopy?: boolean;
  maxAttempts?: number;
  isPublic?: boolean;
}
```

### DELETE /api/quizzes/:id
```typescript
interface DeleteQuizResponse {
  success: boolean;
  message: string;
}
```

### POST /api/quizzes/:id/publish
```typescript
interface PublishQuizResponse {
  success: boolean;
  shareUrl: string;
  accessCode?: string;
}
```

### GET /api/quizzes/:id/results
```typescript
interface GetQuizResultsResponse {
  success: boolean;
  results: QuizSession[];
  analytics: QuizAnalytics;
}
```

## AI Assistant APIs

### POST /api/ai/chat
```typescript
interface AIChatRequest {
  message: string;
  systemPrompt?: string;
  conversationHistory?: ConversationMessage[];
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIChatResponse {
  response: string;
  suggestions?: string[];
  canGenerateQuestions: boolean;
}
```

### POST /api/ai/generate-questions
```typescript
interface GenerateQuestionsRequest {
  topic: string;
  count: number;
  type: QuestionType;
  difficulty: Difficulty;
  systemPromptId?: string;
  includeOptions?: boolean;
  includeExplanation?: boolean;
  minPoints?: number;
  maxPoints?: number;
}

interface GenerateQuestionsResponse {
  success: boolean;
  questions: Question[];
  aiPromptId: string;
}
```

### GET /api/ai/prompts
```typescript
interface GetAIPromptsQuery {
  category?: string;
  isTemplate?: boolean;
  page?: number;
  limit?: number;
}
```

### POST /api/ai/prompts
```typescript
interface CreateAIPromptRequest {
  name: string;
  description?: string;
  systemPrompt: string;
  category: string;
  isTemplate?: boolean;
}
```

### PUT /api/ai/prompts/:id
```typescript
interface UpdateAIPromptRequest {
  name?: string;
  description?: string;
  systemPrompt?: string;
  category?: string;
}
```

## Quiz Taking APIs

### POST /api/quizzes/:id/sessions
```typescript
interface StartQuizSessionRequest {
  participantName: string;
  participantEmail?: string;
  deviceFingerprint?: DeviceFingerprint;
}
```

### POST /api/quizzes/:id/sessions/:sessionId/answers
```typescript
interface SubmitAnswerRequest {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  timeSpent?: number;
}
```

### GET /api/quizzes/:id/sessions/:sessionId
```typescript
interface GetQuizSessionResponse {
  success: boolean;
  session: QuizSession;
  currentQuestion?: Question;
  progress?: {
    currentIndex: number;
    totalQuestions: number;
    percentageComplete: number;
  };
}
```

### POST /api/quizzes/:id/sessions/:sessionId/complete
```typescript
interface CompleteQuizRequest {
  securityEvents: SecurityEvent[];
}
```

## Analytics APIs

### GET /api/analytics/overview
```typescript
interface GetAnalyticsOverviewResponse {
  success: boolean;
  overview: {
    totalQuizzes: number;
    totalParticipants: number;
    totalQuestions: number;
    averageScore: number;
    completionRate: number;
    securityAlerts: number;
  };
}
```

### GET /api/analytics/quiz/:id/performance
```typescript
interface GetQuizPerformanceResponse {
  success: boolean;
  analytics: {
    questionPerformance: QuestionPerformance[];
    participantStats: ParticipantStats[];
  securityEvents: SecurityEvent[];
  };
}
```

### GET /api/analytics/security/events
```typescript
interface GetSecurityEventsResponse {
  success: boolean;
  events: SecurityLog[];
  pagination: PaginationInfo;
}
```

## Data Types

### Core Types
```typescript
// Database types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options: Option[];
  maxPoints: number;
  aiGenerated: boolean;
  rawJsonResponse?: string;
}

export interface Option {
  id: string;
  optionText: string;
  points: number;
  isCorrect: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  enableAntiCopy: boolean;
  accessCode?: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface QuizSession {
  id: string;
  participantName: string;
  participantEmail?: string;
  startedAt: Date;
  completedAt?: Date;
  totalTime?: number;
  suspiciousActivity?: any;
}

// API Response types
export interface ApiResponse<T = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
};

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Security Types
```typescript
export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  details: any;
}

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  fonts: string[];
  webglRenderer?: string;
}

export interface SecurityLog {
  id: string;
  userId?: string;
  sessionId?: string;
  quizId?: string;
  ip?: string;
  events: SecurityEvent[];
  createdAt: Date;
}
```

## Configuration Management

### Environment Variables
```typescript
// Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3001

// Backend (.env)
DATABASE_URL="mysql://user:password@localhost:3306/quiz_platform"
JWT_SECRET=your-super-secret-key
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

## Error Codes
```typescript
export enum ErrorCode {
  // Authentication Errors
  INVALID_CREDENTIALS = 'AUTH_001',
  TOKEN_EXPIRED = 'AUTH_002',
  TOKEN_INVALID = 'AUTH_003',
  USER_NOT_FOUND = 'AUTH_004',
  USER_NOT_VERIFIED = 'AUTH_005',
  
  // Validation Errors
  VALIDATION_FAILED = 'VAL_001',
  REQUIRED_FIELD_MISSING = 'VAL_002',
  INVALID_FIELD_FORMAT = 'VAL_003',
  
  // Business Logic Errors
  QUIZ_NOT_FOUND = 'QUIZ_001',
  QUESTION_NOT_FOUND = 'QUIZ_002',
  INSUFFICIENT_PERMISSIONS = 'QUIZ_003',
  QUIZ_NOT_ACTIVE = 'QUIZ_004',
  QUIZ_ALREADY_COMPLETED = 'QUIZ_005',
  
  // AI Service Errors
  AI_API_ERROR = 'AI_001',
  AI_QUOTA_EXCEEDED = 'AI_002',
  AI_GENERATION_FAILED = 'AI_003',
  
  // System Errors
  INTERNAL_SERVER_ERROR = 'SYS_001',
  DATABASE_CONNECTION_FAILED = 'SYS_002',
  RATE_LIMIT_EXCEEDED = 'SYS_003',
}
```

## Rate Limiting

```typescript
// Rate limit configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: true, // Don't count failed requests
};

// Apply rate limiting middleware
app.use(rateLimiter(rateLimitConfig));
```

## Webhook Configuration

```typescript
// For integrations
const webhookConfig = {
  secretKey: process.env.WEBHOOK_SECRET,
  endpointUrl: process.env.WEBHOOK_ENDPOINT,
  allowedIps: ['127.0.0.1', '192.168.1.1'], // List of allowed IP addresses
  retryAttempts: 3,
  retryDelay: 5000, // 5 seconds between retries
};
```

## API Versioning

```typescript
// Version header
app.use((req, res, next) => {
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-API-Supported-Versions', '1.0.0, 1.1.0, 2.0.0');
  
  next();
});
```

This comprehensive API specification covers all endpoints for the Quiz Generator Platform with modern security features, AI integration, and performance considerations.
