import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().optional(),
});

// Question Bank validation schemas
export const createQuestionBankSchema = z.object({
  name: z.string().min(1, 'Question bank name is required').max(255),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const updateQuestionBankSchema = z.object({
  name: z.string().min(1, 'Question bank name is required').max(255).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  level: z.enum(['SUBJECT', 'TOPIC', 'SUBTOPIC']).default('SUBJECT'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#3B82F6'),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  questionBankId: z.string().min(1, 'Question bank ID is required'),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// Question validation schemas
export const createQuestionSchema = z.object({
  questionBankId: z.string().min(1, 'Question bank ID is required'),
  categoryId: z.string().nullable().optional(),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'ESSAY', 'MATCHING', 'ORDERING']),
  questionText: z.string().min(1, 'Question text is required').max(10000),
  maxPoints: z.number().int().min(1).default(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).default('MEDIUM'),
  timeLimit: z.number().int().min(1).optional(),
  explanation: z.string().optional(),
  idealAnswer: z.string().optional(),
  options: z.array(z.object({
    optionText: z.string().min(1, 'Option text is required').max(1000),
    points: z.number().int().default(0),
    isCorrect: z.boolean().default(false),
    explanation: z.string().optional(),
    order: z.number().int().min(0).default(0),
  })).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateQuestionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required').max(10000).optional(),
  maxPoints: z.number().int().min(1).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  timeLimit: z.number().int().min(1).optional(),
  explanation: z.string().optional(),
  idealAnswer: z.string().optional(),
  isActive: z.boolean().optional(),
  options: z.array(z.object({
    id: z.string().optional(),
    optionText: z.string().min(1, 'Option text is required').max(1000),
    points: z.number().int().default(0),
    isCorrect: z.boolean().default(false),
    explanation: z.string().optional(),
    order: z.number().int().min(0).default(0),
  })).optional(),
});

// Quiz validation schemas
export const createQuizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required').max(255),
  description: z.string().optional(),
  timeLimit: z.number().int().min(1).optional(),
  maxAttempts: z.number().int().min(1).default(1),
  allowRetake: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  shuffleQuestions: z.boolean().default(false),
  showScore: z.boolean().default(false),
  showCorrectAnswers: z.boolean().default(false),
  enableAntiCopy: z.boolean().default(true),
  accessCode: z.string().optional(),
  isPublic: z.boolean().default(false),
  questionIds: z.array(z.string()).min(1, 'At least one question is required'),
  questionPoints: z.record(z.number().int().min(1)).optional(),
});

export const updateQuizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required').max(255).optional(),
  description: z.string().optional(),
  timeLimit: z.number().int().min(1).optional(),
  maxAttempts: z.number().int().min(1).optional(),
  allowRetake: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
  showScore: z.boolean().optional(),
  showCorrectAnswers: z.boolean().optional(),
  enableAntiCopy: z.boolean().optional(),
  accessCode: z.string().optional(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Quiz Session validation schemas
export const startQuizSessionSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID is required'),
});

export const submitAnswerSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  questionId: z.string().min(1, 'Question ID is required'),
  selectedOptionId: z.string().optional(),
  textAnswer: z.string().optional(),
  timeSpent: z.number().int().min(0).default(0),
});

// AI validation schemas
export const generateQuestionsSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  count: z.number().int().min(1).max(10).default(5),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'ESSAY', 'MATCHING', 'ORDERING']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).default('MEDIUM'),
  category: z.string().optional(),
  systemPrompt: z.string().optional(),
});

export const aiChatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.string().optional(),
  })).optional(),
});

// AI Prompt validation schemas
export const createAiPromptSchema = z.object({
  name: z.string().min(1, 'Prompt name is required').max(255),
  description: z.string().optional(),
  systemPrompt: z.string().min(10, 'System prompt must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  isTemplate: z.boolean().default(false),
});

// Search and filter validation schemas
export const questionSearchSchema = z.object({
  search: z.string().optional(),
  type: z.array(z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'ESSAY', 'MATCHING', 'ORDERING'])).optional(),
  difficulty: z.array(z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT'])).optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  questionBankId: z.string().optional(),
  aiGenerated: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const quizSearchSchema = z.object({
  search: z.string().optional(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Settings validation schemas
export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  notifications: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().int().min(300).max(86400).optional(), // 5 minutes to 24 hours
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Export all schemas
export const validationSchemas = {
  register: registerSchema,
  login: loginSchema,
  createQuestionBank: createQuestionBankSchema,
  updateQuestionBank: updateQuestionBankSchema,
  createCategory: createCategorySchema,
  updateCategory: updateCategorySchema,
  createQuestion: createQuestionSchema,
  updateQuestion: updateQuestionSchema,
  createQuiz: createQuizSchema,
  updateQuiz: updateQuizSchema,
  startQuizSession: startQuizSessionSchema,
  submitAnswer: submitAnswerSchema,
  generateQuestions: generateQuestionsSchema,
  aiChat: aiChatSchema,
  createAiPrompt: createAiPromptSchema,
  questionSearch: questionSearchSchema,
  quizSearch: quizSearchSchema,
  updateSettings: updateSettingsSchema,
  changePassword: changePasswordSchema,
};
