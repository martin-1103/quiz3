# Database Schema Design

## Overview

Quiz Generator Platform menggunakan **MySQL 9.0+** dengan **Prisma 6.0+ ORM** untuk optimal performa dan AI-powered query optimization. Schema dirancang untuk mendukung **AI-generated questions**, **per-option scoring**, dan **comprehensive security logging**.

## Core Design Principles

### 1. Relational Approach
- **Normalization** untuk optimal performance
- **Strategic indexing** untuk query optimization
- **Foreign key constraints** untuk data integrity
- **Composite indexes** untuk complex queries

### 2. AI-Ready Architecture
- **JSON columns** untuk raw AI responses (logging only)
- **AI tracking fields** untuk monitoring AI performance
- **Template storage** untuk custom system prompts
- **Version control** untuk AI-generated content

### 3. Security-First Design
- **Audit logging** untuk semua sensitive operations
- **Browser fingerprinting** data storage
- **Suspicious activity tracking**
- **Session security metadata**

## Complete Database Schema

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// =============================================================================
// AUTHENTICATION & USER MANAGEMENT
// =============================================================================

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  name              String?
  password          String
  avatar            String?   @db.Text
  role              UserRole  @default(USER)
  isActive          Boolean   @default(true)
  lastLoginAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  questionBanks     QuestionBank[]
  categories        Category[]
  quizzes           Quiz[]
  aiPrompts          AiPrompt[]
  quizSessions      QuizSession[]
  securityLogs      SecurityLog[]
  settings          UserSettings?

  @@map("users")
  @@index([email])
  @@index([isActive])
  @@index([createdAt])
}

model UserSettings {
  id                   String   @id @default(cuid())
  userId               String   @unique
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // UI Preferences
  theme                String   @default("light") // light, dark, system
  language             String   @default("en")
  timezone             String   @default("UTC")
  
  // Notification Settings
  emailNotifications   Boolean  @default(true)
  securityAlerts       Boolean  @default(true)
  
  // Security Settings
  twoFactorEnabled     Boolean  @default(false)
  sessionTimeout       Int      @default(3600) // seconds
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@map("user_settings")
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

// =============================================================================
// QUESTION BANK SYSTEM
// =============================================================================

model QuestionBank {
  id            String   @id @default(cuid())
  name          String
  description   String?  @db.Text
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  isPublic      Boolean  @default(false)
  isArchived    Boolean  @default(false)
  tags          String[] // Array of tags for easy filtering
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  questions     Question[]
  categories    Category[]

  @@map("question_banks")
  @@index([userId])
  @@index([isPublic])
  @@index([isArchived])
}

model Category {
  id            String     @id @default(cuid())
  name          String
  description   String?    @db.Text
  parentId      String?
  parent        Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children      Category[] @relation("CategoryHierarchy")
  userId        String
  user          User       @relation(fields: [userId], references: [id])
  level         Int        @default(0) // 0=Subject, 1=Topic, 2=Subtopic
  color         String?    @default("#3B82F6") // Hex color for UI
  icon          String?    // Icon name for UI
  isActive      Boolean    @default(true)
  sortOrder     Int        @default(0)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relations
  questions     Question[]
  questionBanks QuestionBank[]

  @@map("categories")
  @@index([userId])
  @@index([parentId])
  @@index([level])
  @@index([isActive])
}

// =============================================================================
// QUESTIONS & AI INTEGRATION
// =============================================================================

model Question {
  id                String        @id @default(cuid())
  questionBankId    String
  questionBank      QuestionBank  @relation(fields: [questionBankId], references: [id])
  categoryId        String?
  category          Category?     @relation(fields: [categoryId], references: [id])
  type              QuestionType
  questionText      String        @db.Text
  idealAnswer       String?       @db.Text // For essay questions
  explanation       String?       @db.Text // Explanation for correct answer
  timeLimit         Int?          // seconds per question
  maxPoints         Int           @default(1)
  difficulty        Difficulty    @default(MEDIUM)
  tags              String[]
  aiGenerated       Boolean       @default(false)
  aiPromptId         String?       // Reference to AI prompt used
  rawJsonResponse   String?       @db.LongText // Raw AI response for logging
  isPublic          Boolean       @default(false)
  isArchived        Boolean       @default(false)
  usageCount        Int           @default(0) // Track how many times used
  averageScore      Float?        // Average score from all attempts
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  // Relations
  options           Option[]
  quizQuestions     QuizQuestion[]
  answers           Answer[]
  aiUsageLogs       AiUsageLog[]

  @@map("questions")
  @@index([questionBankId])
  @@index([categoryId])
  @@index([type])
  @@index([difficulty])
  @@index([aiGenerated])
  @@index([isPublic])
  @@index([createdAt])
}

model Option {
  id          String   @id @default(cuid())
  questionId  String
  question    Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  optionText  String
  points      Int      @default(0) // Per-option scoring system
  isCorrect   Boolean  @default(false)
  order       Int      @default(0)
  explanation  String?  @db.Text // Why this option is correct/incorrect
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("options")
  @@index([questionId])
  @@index([isCorrect])
}

enum QuestionType {
  MULTIPLE_CHOICE
  ESSAY
  TRUE_FALSE
  FILL_BLANK
  MATCHING
  DRAG_DROP
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
  EXPERT
}

// =============================================================================
// AI PROMPT MANAGEMENT
// =============================================================================

model AiPrompt {
  id            String   @id @default(cuid())
  name          String
  description   String?  @db.Text
  systemPrompt  String   @db.Text // Custom system prompt for GPT-5
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  isTemplate    Boolean  @default(false) // Public template
  category      String   @default("general") // math, science, language, etc.
  tags          String[]
  usageCount    Int      @default(0)
  averageRating Float?   // User ratings for template quality
  isArchived    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  questions     Question[]
  aiUsageLogs   AiUsageLog[]

  @@map("ai_prompts")
  @@index([userId])
  @@index([isTemplate])
  @@index([category])
}

model AiUsageLog {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  aiPromptId      String?
  aiPrompt        AiPrompt? @relation(fields: [aiPromptId], references: [id])
  questionId      String?
  question        Question? @relation(fields: [questionId], references: [id])
  
  // Request details
  requestType     AiRequestType // GENERATE_QUESTIONS, SCORE_ESSAY, IMPROVE_CONTENT
  inputTokens     Int        // Input tokens used
  outputTokens    Int        // Output tokens generated
  cost            Float      // Cost in USD
  
  // Response details
  responseTime    Int        // Response time in milliseconds
  modelUsed       String     // GPT-5 model variant
  success         Boolean
  errorMessage    String?
  
  // Content tracking
  questionsGenerated Int?    // Number of questions generated
  qualityRating   Float?     // 1-10 rating of AI response
  
  createdAt       DateTime   @default(now())

  @@map("ai_usage_logs")
  @@index([userId])
  @@index([aiPromptId])
  @@index([requestType])
  @@index([createdAt])
}

enum AiRequestType {
  GENERATE_QUESTIONS
  SCORE_ESSAY
  IMPROVE_CONTENT
  VALIDATE_QUESTION
  GENERATE_EXPLANATION
}

// =============================================================================
// QUIZ MANAGEMENT
// =============================================================================

model Quiz {
  id                  String           @id @default(cuid())
  title               String
  description         String?          @db.Text
  userId              String
  user                User             @relation(fields: [userId], references: [id])
  timeLimit           Int?             // Global time limit in seconds
  isActive            Boolean          @default(false)
  isPublic            Boolean          @default(false)
  showScoreToUser    Boolean          @default(false)
  enableAntiCopy     Boolean          @default(true)
  allowRetake         Boolean          @default(false)
  maxAttempts         Int              @default(1)
  shuffleQuestions   Boolean          @default(false)
  shuffleOptions     Boolean          @default(true)
  
  // Security settings
  requireProctoring   Boolean          @default(false)
  detectSuspicious    Boolean          @default(true)
  logIpAddress       Boolean          @default(true)
  logBrowserInfo     Boolean          @default(true)
  
  // Metadata
  category            String?          @default("general")
  tags                String[]
  difficulty          Difficulty?      @default(MEDIUM)
  estimatedTime      Int?             // Estimated completion time in minutes
  
  // Publication
  publishedAt         DateTime?
  accessCode          String?          @unique // Private quiz access code
  
  // Statistics
  totalParticipants   Int              @default(0)
  averageScore        Float?
  averageTimeSpent    Int?             // Average time in seconds
  completionRate      Float?           // Percentage
  
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt

  // Relations
  questionGroups      QuizQuestionGroup[]
  sessions            QuizSession[]
  quizAnalytics       QuizAnalytics[]
  accessLogs          QuizAccessLog[]

  @@map("quizzes")
  @@index([userId])
  @@index([isActive])
  @@index([isPublic])
  @@index([publishedAt])
  @@index([accessCode])
}

model QuizQuestionGroup {
  id                 String           @id @default(cuid())
  quizId             String
  quiz               Quiz             @relation(fields: [quizId], references: [id], onDelete: Cascade)
  questionGroupId   String?
  questionGroup      QuestionGroup?   @relation(fields: [questionGroupId], references: [id])
  questionBankId     String?
  questionBank       QuestionBank?   @relation(fields: [questionBankId], references: [id])
  categoryId         String?
  category           Category?        @relation(fields: [categoryId], references: [id])
  questions          Question[]       // Direct question selection
  
  // Configuration
  randomOrder         Boolean          @default(false)
  selectRandom        Int?             // Number of random questions to select
  pointsMultiplier    Float            @default(1.0) // Multiply points for this group
  
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  @@map("quiz_question_groups")
  @@index([quizId])
  @@index([questionGroupId])
  @@index([questionBankId])
}

model QuestionGroup {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  questions   Question[]
  quizzes     QuizQuestionGroup[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("question_groups")
  @@index([userId])
}

// =============================================================================
// QUIZ SESSIONS & PARTICIPANT DATA
// =============================================================================

model QuizSession {
  id                    String            @id @default(cuid())
  quizId                String
  quiz                  Quiz              @relation(fields: [quizId], references: [id])
  participantName       String
  participantEmail      String?
  participantPhone      String?
  
  // Session lifecycle
  startedAt             DateTime          @default(now())
  completedAt           DateTime?
  lastActivityAt        DateTime          @default(now())
  totalTime             Int?              // Total time in seconds
  
  // Security tracking
  ipAddress             String?
  browserInfo           Json?             // Browser fingerprinting data
  suspiciousActivities  Json?             // Array of suspicious events
  securityScore         Float?            // Security score 0-100
  isFlagged             Boolean           @default(false)
  
  // Results
  totalScore            Int?
  maxPossibleScore     Int?
  percentageScore       Float?
  passed                Boolean?
  
  // Metadata
  deviceType            String?           // mobile, desktop, tablet
  userAgent             String?           @db.Text
  referrer              String?
  
  createdAt             DateTime          @default(now())

  // Relations
  answers               Answer[]
  securityLogs          SecurityLog[]
  accessLogs            QuizAccessLog[]

  @@map("quiz_sessions")
  @@index([quizId])
  @@index([participantEmail])
  @@index([startedAt])
  @@index([completedAt])
  @@index([isFlagged])
}

model Answer {
  id                 String    @id @default(cuid())
  quizSessionId      String
  quizSession        QuizSession @relation(fields: [quizSessionId], references: [id], onDelete: Cascade)
  questionId         String
  question           Question  @relation(fields: [questionId], references: [id])
  selectedOptionId    String?
  selectedOption      Option?   @relation(fields: [selectedOptionId], references: [id])
  textAnswer          String?   @db.Text // For essay questions
  
  // Scoring
  earnedPoints        Int?
  aiScore             Float?    // AI-generated score (0-1 for essays)
  maxPoints           Int?      // Maximum possible points for this question
  isCorrect           Boolean?
  confidence          Float?    // AI confidence in scoring
  
  // AI Feedback
  aiFeedback          String?   @db.Text
  aiReasoning         String?   @db.Text
  improvementAreas    String[]  // AI suggestions for improvement
  
  // Time tracking
  timeSpent           Int?      // Time spent on this question in seconds
  answeredAt          DateTime  @default(now())
  modifiedAt          DateTime? // If user changed answer
  
  // Security
  suspiciousActivity  Boolean   @default(false)
  
  createdAt          DateTime  @default(now())

  @@map("answers")
  @@index([quizSessionId])
  @@index([questionId])
  @@index([selectedOptionId])
  @@index([isCorrect])
}

// =============================================================================
// ANALYTICS & REPORTING
// =============================================================================

model QuizAnalytics {
  id              String   @id @default(cuid())
  quizId          String
  quiz            Quiz     @relation(fields: [quizId], references: [id])
  date            DateTime @default(now())
  
  // Daily statistics
  totalSessions   Int      @default(0)
  completedSessions Int     @default(0)
  averageScore    Float?
  averageTime     Int?     // in seconds
  completionRate  Float?   // percentage
  
  // Device breakdown
  mobileCount    Int      @default(0)
  desktopCount   Int      @default(0)
  tabletCount    Int      @default(0)
  
  // Performance metrics
  averageQuestionTime Int? // average time per question
  difficultQuestions   Json? // Array of most challenging question IDs
  popularQuestions      Json? // Array of most answered question IDs

  @@map("quiz_analytics")
  @@index([quizId])
  @@index([date])
  @@unique([quizId, date])
}

// =============================================================================
// SECURITY & MONITORING
// =============================================================================

model SecurityLog {
  id            String        @id @default(cuid())
  userId        String?
  user          User?         @relation(fields: [userId], references: [id])
  sessionId     String?       // Quiz session ID if applicable
  quizId        String?       // Quiz ID if applicable
  
  // Event details
  eventType     SecurityEventType
  severity      SecuritySeverity
  description   String        @db.Text
  details       Json?         // Additional event data
  
  // Location tracking
  ipAddress     String?
  userAgent     String?       @db.Text
  timestamp     DateTime      @default(now())
  
  // Resolution
  resolved      Boolean       @default(false)
  resolvedBy    String?
  resolvedAt    DateTime?
  resolution    String?       @db.Text

  @@map("security_logs")
  @@index([userId])
  @@index([sessionId])
  @@index([eventType])
  @@index([severity])
  @@index([timestamp])
  @@index([resolved])
}

enum SecurityEventType {
  COPY_ATTEMPT
  SELECT_ATTEMPT
  RIGHT_CLICK_ATTEMPT
  PRINT_ATTEMPT
  TAB_SWITCH
  DEV_TOOLS_OPENED
  SUSPICIOUS_ACTIVITY
  MULTIPLE_VIOLATIONS
  SESSION_TERMINATED
  UNAUTHORIZED_ACCESS
  BRUTE_FORCE_ATTEMPT
}

enum SecuritySeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model QuizAccessLog {
  id            String   @id @default(cuid())
  quizId        String
  quiz          Quiz     @relation(fields: [quizId], references: [id])
  sessionId     String?  // Session ID if registered participant
  ipAddress    String
  userAgent     String?  @db.Text
  referrer      String?
  
  // Access details
  accessType    AccessType
  success       Boolean
  errorMessage  String?
  
  // Geographic data (optional)
  country       String?
  city          String?
  
  createdAt     DateTime @default(now())

  @@map("quiz_access_logs")
  @@index([quizId])
  @@index([sessionId])
  @@index([ipAddress])
  @@index([createdAt])
}

enum AccessType {
  QUIZ_START
  QUIZ_COMPLETE
  QUIZ_ABANDON
  ACCESS_DENIED
  SHARE_LINK_CLICK
  EMBED_VIEW
}

// =============================================================================
// SETTINGS & CONFIGURATION
// =============================================================================

model SystemConfig {
  id              String   @id @default(cuid())
  key             String   @unique
  value           Json     // Flexible JSON value
  description     String?  @db.Text
  isPublic        Boolean  @default(false) // Whether this config is public
  category        String   @default("general")
  updatedAt       DateTime @updatedAt
  updatedBy       String?  // User ID who updated

  @@map("system_config")
  @@index([key])
  @@index([category])
  @@index([isPublic])
}

// =============================================================================
// VIEWS & OPTIMIZATION
// =============================================================================

// View for quiz statistics (for reporting)
CREATE VIEW quiz_statistics AS
SELECT 
  q.id as quiz_id,
  q.title as quiz_title,
  q.user_id,
  COUNT(DISTINCT qs.id) as total_participants,
  COUNT(CASE WHEN qs.completedAt IS NOT NULL THEN 1 END) as completed_participants,
  AVG(qs.totalScore) as average_score,
  AVG(qs.totalTime) as average_time_seconds,
  q.created_at,
  q.published_at
FROM quizzes q
LEFT JOIN quiz_sessions qs ON q.id = qs.quizId
GROUP BY q.id;

// Indexes for performance optimization
CREATE INDEX idx_questions_type_difficulty ON questions(type, difficulty);
CREATE INDEX idx_questions_bank_active ON questions(questionBankId, isArchived);
CREATE INDEX idx_quiz_sessions_quiz_completed ON quiz_sessions(quizId, completedAt);
CREATE INDEX idx_answers_session_question ON answers(quizSessionId, questionId);
CREATE INDEX idx_security_logs_severity_timestamp ON security_logs(severity, timestamp);
CREATE INDEX idx_ai_logs_user_type ON ai_usage_logs(userId, requestType);
```

## Database Optimization Features

### 1. Prisma AI-Powered Optimization
```typescript
// Enable Prisma Optimize for AI query analysis
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// AI-powered query recommendations
const optimizedQuestions = await prisma.question.findMany({
  where: {
    difficulty: 'HARD',
    type: 'MULTIPLE_CHOICE',
  },
  include: {
    options: true,
    category: true,
    questionBank: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

### 2. Strategic Indexing
- **Composite indexes** untuk complex queries
- **Partial indexes** untuk filtered data
- **Covering indexes** untuk frequent query patterns
- **JSON indexes** untuk AI response searching

### 3. Connection Pooling
```typescript
// Production database configuration
const databaseConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production',
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
  },
  // Connection string for production
  url: process.env.DATABASE_URL,
};
```

### 4. Caching Strategy
- **Query result caching** for frequently accessed data
- **AI response caching** for similar prompts
- **Session caching** for active quiz sessions
- **Analytics caching** for dashboard data

## Migration Strategy

### 1. Incremental Migrations
```typescript
// prisma/migrations/001_initial_schema.sql
-- Create base tables
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

// prisma/migrations/002_ai_features.sql
-- Add AI-related tables
ALTER TABLE questions 
ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN ai_prompt_id VARCHAR(255),
ADD COLUMN raw_json_response LONGTEXT;

// prisma/migrations/003_security_features.sql
-- Add security logging
CREATE TABLE security_logs (
  id VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details JSON
);
```

### 2. Data Validation
```typescript
// Comprehensive data validation with Zod
const QuestionSchema = z.object({
  id: z.string().cuid(),
  questionText: z.string().min(1).max(10000),
  type: z.enum(['MULTIPLE_CHOICE', 'ESSAY', 'TRUE_FALSE']),
  maxPoints: z.number().min(1).max(100),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  options: z.array(z.object({
    optionText: z.string().min(1),
    points: z.number().min(0).max(100),
    isCorrect: z.boolean(),
  })),
});

type Question = z.infer<typeof QuestionSchema>;
```

## Performance Monitoring

### 1. Query Performance Metrics
- **Slow query identification** dengan Prisma Optimize
- **Query execution time tracking**
- **Database connection monitoring**
- **AI API response time tracking**

### 2. Analytics Queries
```sql
-- Most used question banks
SELECT 
  qb.name,
  COUNT(q.id) as question_count,
  AVG(q.averageScore) as avg_score
FROM question_banks qb
JOIN questions q ON qb.id = q.questionBankId
GROUP BY qb.id
ORDER BY question_count DESC;

-- AI performance metrics
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_requests,
  AVG(responseTime) as avg_response_time,
  AVG(CASE WHEN success THEN 1 ELSE 0 END) as success_rate,
  SUM(cost) as total_cost
FROM ai_usage_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

This database schema provides a comprehensive foundation for the Quiz Generator Platform with AI integration, security monitoring, and performance optimization built-in from the ground up.
