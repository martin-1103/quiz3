import { Router } from 'express';
import { authenticateToken, optionalAuth } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { QuizController } from '@/controllers/QuizController';

const router = Router();
const quizController = new QuizController();

// Public routes
router.get('/public', optionalAuth, asyncHandler(quizController.getPublicQuizzes.bind(quizController)));
router.get('/:id/access', optionalAuth, asyncHandler(quizController.checkQuizAccess.bind(quizController)));

// Protected routes
router.get('/', authenticateToken, asyncHandler(quizController.getQuizzes.bind(quizController)));
router.get('/:id', authenticateToken, asyncHandler(quizController.getQuizById.bind(quizController)));
router.post('/', authenticateToken, asyncHandler(quizController.createQuiz.bind(quizController)));
router.put('/:id', authenticateToken, asyncHandler(quizController.updateQuiz.bind(quizController)));
router.delete('/:id', authenticateToken, asyncHandler(quizController.deleteQuiz.bind(quizController)));
router.post('/:id/publish', authenticateToken, asyncHandler(quizController.publishQuiz.bind(quizController)));
router.post('/:id/unpublish', authenticateToken, asyncHandler(quizController.unpublishQuiz.bind(quizController)));
router.post('/:id/duplicate', authenticateToken, asyncHandler(quizController.duplicateQuiz.bind(quizController)));

// Quiz session routes
router.post('/:id/start', authenticateToken, asyncHandler(quizController.startQuizSession.bind(quizController)));
router.get('/:id/sessions/:sessionToken', optionalAuth, asyncHandler(quizController.getQuizSession.bind(quizController)));
router.post('/sessions/:sessionToken/answer', optionalAuth, asyncHandler(quizController.submitAnswer.bind(quizController)));
router.post('/sessions/:sessionToken/complete', optionalAuth, asyncHandler(quizController.completeQuiz.bind(quizController)));

// Quiz results routes
router.get('/:id/results', authenticateToken, asyncHandler(quizController.getQuizResults.bind(quizController)));
router.get('/sessions/:sessionToken/results', optionalAuth, asyncHandler(quizController.getSessionResults.bind(quizController)));

export default router;
