import { Router } from 'express';
import { authenticateToken, requireRole } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { AnalyticsController } from '@/controllers/AnalyticsController';

const router = Router();
const analyticsController = new AnalyticsController();

// All analytics routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// Overview analytics
router.get('/overview', asyncHandler(analyticsController.getOverview.bind(analyticsController)));

// Quiz analytics
router.get('/quizzes/:id/performance', asyncHandler(analyticsController.getQuizPerformance.bind(analyticsController)));
router.get('/quizzes/:id/questions', asyncHandler(analyticsController.getQuizQuestionAnalytics.bind(analyticsController)));
router.get('/quizzes/:id/sessions', asyncHandler(analyticsController.getQuizSessionAnalytics.bind(analyticsController)));

// User analytics
router.get('/users/engagement', asyncHandler(analyticsController.getUserEngagement.bind(analyticsController)));
router.get('/users/activity', asyncHandler(analyticsController.getUserActivity.bind(analyticsController)));

// Question analytics
router.get('/questions/usage', asyncHandler(analyticsController.getQuestionUsage.bind(analyticsController)));
router.get('/questions/performance', asyncHandler(analyticsController.getQuestionPerformance.bind(analyticsController)));

// Security analytics
router.get('/security/events', asyncHandler(analyticsController.getSecurityEvents.bind(analyticsController)));
router.get('/security/overview', asyncHandler(analyticsController.getSecurityOverview.bind(analyticsController)));

// AI analytics
router.get('/ai/usage', asyncHandler(analyticsController.getAiUsage.bind(analyticsController)));
router.get('/ai/performance', asyncHandler(analyticsController.getAiPerformance.bind(analyticsController)));

export default router;
