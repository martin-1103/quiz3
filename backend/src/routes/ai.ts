import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { aiLimiter } from '@/middleware/security';
import { asyncHandler } from '@/middleware/errorHandler';
import { AiController } from '@/controllers/AiController';

const router = Router();
const aiController = new AiController();

// All AI routes require authentication and have stricter rate limiting
router.use(authenticateToken);
router.use(aiLimiter);

// Chat endpoints
router.post('/chat', asyncHandler(aiController.chat.bind(aiController)));

// Question generation endpoints
router.post('/generate-questions', asyncHandler(aiController.generateQuestions.bind(aiController)));
router.post('/improve-question/:id', asyncHandler(aiController.improveQuestion.bind(aiController)));
router.post('/generate-options/:id', asyncHandler(aiController.generateOptions.bind(aiController)));

// Essay scoring
router.post('/score-essay', asyncHandler(aiController.scoreEssay.bind(aiController)));

// AI Prompt management
router.get('/prompts', asyncHandler(aiController.getAiPrompts.bind(aiController)));
router.post('/prompts', asyncHandler(aiController.createAiPrompt.bind(aiController)));
router.put('/prompts/:id', asyncHandler(aiController.updateAiPrompt.bind(aiController)));
router.delete('/prompts/:id', asyncHandler(aiController.deleteAiPrompt.bind(aiController)));
router.post('/prompts/:id/use', asyncHandler(aiController.useAiPrompt.bind(aiController)));

export default router;
