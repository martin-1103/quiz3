import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { authLimiter } from '@/middleware/security';
import { asyncHandler } from '@/middleware/errorHandler';
import { AuthController } from '@/controllers/AuthController';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authLimiter, asyncHandler(authController.register.bind(authController)));
router.post('/login', authLimiter, asyncHandler(authController.login.bind(authController)));
router.post('/refresh', asyncHandler(authController.refreshToken.bind(authController)));
router.post('/forgot-password', authLimiter, asyncHandler(authController.forgotPassword.bind(authController)));
router.post('/reset-password', authLimiter, asyncHandler(authController.resetPassword.bind(authController)));

// Protected routes
router.post('/logout', authenticateToken, asyncHandler(authController.logout.bind(authController)));
router.get('/me', authenticateToken, asyncHandler(authController.getProfile.bind(authController)));
router.put('/profile', authenticateToken, asyncHandler(authController.updateProfile.bind(authController)));
router.post('/change-password', authenticateToken, asyncHandler(authController.changePassword.bind(authController)));
router.post('/enable-2fa', authenticateToken, asyncHandler(authController.enableTwoFactor.bind(authController)));
router.post('/verify-2fa', authenticateToken, asyncHandler(authController.verifyTwoFactor.bind(authController)));
router.post('/disable-2fa', authenticateToken, asyncHandler(authController.disableTwoFactor.bind(authController)));

export default router;
