import { Router } from 'express';
import { authenticateToken, optionalAuth } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { QuestionController } from '@/controllers/QuestionController';

const router = Router();
const questionController = new QuestionController();

// Public routes (for public question banks)
router.get('/public', optionalAuth, asyncHandler(questionController.getPublicQuestions.bind(questionController)));

// Protected routes
router.get('/', authenticateToken, asyncHandler(questionController.getQuestions.bind(questionController)));
router.get('/:id', authenticateToken, asyncHandler(questionController.getQuestionById.bind(questionController)));
router.post('/', authenticateToken, asyncHandler(questionController.createQuestion.bind(questionController)));
router.put('/:id', authenticateToken, asyncHandler(questionController.updateQuestion.bind(questionController)));
router.delete('/:id', authenticateToken, asyncHandler(questionController.deleteQuestion.bind(questionController)));
router.post('/search', authenticateToken, asyncHandler(questionController.searchQuestions.bind(questionController)));
router.post('/:id/duplicate', authenticateToken, asyncHandler(questionController.duplicateQuestion.bind(questionController)));
router.get('/export/csv', authenticateToken, asyncHandler(questionController.exportQuestionsToCSV.bind(questionController)));
router.post('/import/csv', authenticateToken, asyncHandler(questionController.importQuestionsFromCSV.bind(questionController)));

export default router;
