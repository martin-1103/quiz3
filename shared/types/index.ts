// Shared types between frontend and backend

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_BLANK = 'FILL_BLANK',
  ESSAY = 'ESSAY',
  MATCHING = 'MATCHING',
  ORDERING = 'ORDERING',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

export enum CategoryLevel {
  SUBJECT = 'SUBJECT',
  TOPIC = 'TOPIC',
  SUBTOPIC = 'SUBTOPIC',
}

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  COPY_ATTEMPT = 'COPY_ATTEMPT',
  RIGHT_CLICK_ATTEMPT = 'RIGHT_CLICK_ATTEMPT',
  DEV_TOOLS_DETECTED = 'DEV_TOOLS_DETECTED',
  TAB_SWITCH = 'TAB_SWITCH',
  WINDOW_BLUR = 'WINDOW_BLUR',
  PRINT_ATTEMPT = 'PRINT_ATTEMPT',
  SCREENSHOT_ATTEMPT = 'SCREENSHOT_ATTEMPT',
  KEYBOARD_SHORTCUT = 'KEYBOARD_SHORTCUT',
  PASTE_ATTEMPT = 'PASTE_ATTEMPT',
  SELECT_TEXT_ATTEMPT = 'SELECT_TEXT_ATTEMPT',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Base interfaces
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User interfaces
export interface User extends BaseEntity {
  email: string;
  emailVerified: boolean;
  name?: string;
  role: UserRole;
  avatar?: string;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  isActive: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Question Bank interfaces
export interface QuestionBank extends BaseEntity {
  name: string;
  description?: string;
  isPublic: boolean;
  userId: string;
}

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  parentId?: string;
  level: CategoryLevel;
  color: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  userId: string;
  questionBankId: string;
  children?: Category[];
}

export interface Question extends BaseEntity {
  questionBankId: string;
  categoryId?: string;
  type: QuestionType;
  questionText: string;
  maxPoints: number;
  difficulty: DifficultyLevel;
  timeLimit?: number;
  explanation?: string;
  idealAnswer?: string;
  aiGenerated: boolean;
  aiPrompt?: string;
  isActive: boolean;
  options?: Option[];
  tags?: Tag[];
}

export interface Option extends BaseEntity {
  questionId: string;
  optionText: string;
  points: number;
  isCorrect: boolean;
  explanation?: string;
  order: number;
}

export interface Tag extends BaseEntity {
  name: string;
  color: string;
  userId: string;
}

// Quiz interfaces
export interface Quiz extends BaseEntity {
  title: string;
  description?: string;
  userId: string;
  timeLimit?: number;
  maxAttempts: number;
  allowRetake: boolean;
  shuffleOptions: boolean;
  shuffleQuestions: boolean;
  showScore: boolean;
  showCorrectAnswers: boolean;
  enableAntiCopy: boolean;
  accessCode?: string;
  isPublic: boolean;
  isActive: boolean;
  publishedAt?: Date;
  questions?: QuizQuestion[];
}

export interface QuizQuestion extends BaseEntity {
  quizId: string;
  questionId: string;
  order: number;
  points: number;
  question?: Question;
}

export interface QuizSession extends BaseEntity {
  quizId: string;
  userId: string;
  sessionToken: string;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number;
  score?: number;
  maxScore?: number;
  attempt: number;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  answers?: Answer[];
}

export interface Answer extends BaseEntity {
  sessionId: string;
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  earnedPoints: number;
  timeSpent: number;
  answeredAt: Date;
}

// AI interfaces
export interface AiPrompt extends BaseEntity {
  name: string;
  description?: string;
  systemPrompt: string;
  category: string;
  isTemplate: boolean;
  userId: string;
  usageCount: number;
  averageRating: number;
  isActive: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface GenerateQuestionsRequest {
  prompt: string;
  count: number;
  type: QuestionType;
  difficulty: DifficultyLevel;
  category?: string;
  systemPrompt?: string;
}

// Security interfaces
export interface SecurityLog extends BaseEntity {
  userId?: string;
  sessionId?: string;
  eventType: SecurityEventType;
  description: string;
  ipAddress: string;
  userAgent: string;
  severity: SecuritySeverity;
  metadata?: any;
}

export interface SecurityEvent {
  id: string;
  sessionId: string;
  eventType: SecurityEventType;
  description: string;
  data?: any;
  timestamp: Date;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and search interfaces
export interface QuestionFilters {
  type?: QuestionType[];
  difficulty?: DifficultyLevel[];
  tags?: string[];
  categoryId?: string;
  questionBankId?: string;
  search?: string;
  aiGenerated?: boolean;
  limit?: number;
  offset?: number;
}

export interface QuizFilters {
  userId?: string;
  isPublic?: boolean;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

// Quiz creation interfaces
export interface CreateQuizRequest {
  title: string;
  description?: string;
  timeLimit?: number;
  maxAttempts?: number;
  allowRetake?: boolean;
  shuffleOptions?: boolean;
  shuffleQuestions?: boolean;
  showScore?: boolean;
  showCorrectAnswers?: boolean;
  enableAntiCopy?: boolean;
  accessCode?: string;
  isPublic?: boolean;
  questionIds: string[];
  questionPoints?: Record<string, number>;
}

export interface CreateQuestionRequest {
  questionBankId: string;
  categoryId?: string;
  type: QuestionType;
  questionText: string;
  maxPoints?: number;
  difficulty?: DifficultyLevel;
  timeLimit?: number;
  explanation?: string;
  idealAnswer?: string;
  options?: CreateOptionRequest[];
  tags?: string[];
}

export interface CreateOptionRequest {
  optionText: string;
  points: number;
  isCorrect: boolean;
  explanation?: string;
  order?: number;
}

// Analytics interfaces
export interface AnalyticsOverview {
  totalQuizzes: number;
  totalParticipants: number;
  totalQuestions: number;
  averageScore: number;
  completionRate: number;
  totalSecurityEvents: number;
}

export interface QuizAnalytics {
  quizId: string;
  totalParticipants: number;
  completedSessions: number;
  averageScore: number;
  averageTimeSpent: number;
  completionRate: number;
  questionPerformance: QuestionPerformance[];
}

export interface QuestionPerformance {
  questionId: string;
  correctAnswers: number;
  totalAnswers: number;
  averageTimeSpent: number;
  difficulty: DifficultyLevel;
}

// User Settings interfaces
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
}
