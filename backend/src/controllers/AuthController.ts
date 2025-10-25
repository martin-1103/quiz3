import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import { ApiResponse, AuthResponse, UserProfile, LoginRequest, RegisterRequest } from '@/types';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { validationSchemas } from '@/utils/validation';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

// Helper function to convert Prisma User to UserProfile
const toUserProfile = (user: Partial<User> & { id: string; email: string; role: string; createdAt: Date; updatedAt: Date }): UserProfile => ({
  id: user.id,
  email: user.email,
  name: user.name || null,
  role: user.role,
  avatar: user.avatar || null,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = validationSchemas.register.parse(req.body) as RegisterRequest;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new CustomError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        passwordHash,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: toUserProfile(user),
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
      message: 'User registered successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = validationSchemas.login.parse(req.body) as LoginRequest;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new CustomError('Account is deactivated', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: toUserProfile(user),
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new CustomError('Refresh token is required', 400);
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new CustomError('Invalid refresh token', 401);
      }

      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);

      const response: ApiResponse<{ accessToken: string; refreshToken: string }> = {
        success: true,
        data: { accessToken, refreshToken: newRefreshToken },
        message: 'Tokens refreshed successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      throw new CustomError('Invalid refresh token', 401);
    }
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    // In a real implementation, you would invalidate the token
    // by adding it to a blacklist or using a token store
    
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const response: ApiResponse<UserProfile> = {
      success: true,
      data: toUserProfile(user),
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const response: ApiResponse<UserProfile> = {
      success: true,
      data: toUserProfile(user),
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = validationSchemas.changePassword.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new CustomError('Current password is incorrect', 400);
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { passwordHash: newPasswordHash },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    // This would typically send an email with a reset link
    // For now, we'll just return a success message
    
    const response: ApiResponse = {
      success: true,
      message: 'If an account with this email exists, a reset link has been sent',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    // This would typically verify a reset token and update the password
    // For now, we'll just return a success message
    
    const response: ApiResponse = {
      success: true,
      message: 'Password reset successful',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  });

  enableTwoFactor = asyncHandler(async (req: Request, res: Response) => {
    // This would typically generate a 2FA secret and QR code
    // For now, we'll just return a success message
    
    const response: ApiResponse = {
      success: true,
      message: 'Two-factor authentication enabled',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  });

  verifyTwoFactor = asyncHandler(async (req: Request, res: Response) => {
    // This would typically verify a 2FA code
    // For now, we'll just return a success message
    
    const response: ApiResponse = {
      success: true,
      message: 'Two-factor authentication verified',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  });

  disableTwoFactor = asyncHandler(async (req: Request, res: Response) => {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { 
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Two-factor authentication disabled',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  });

  private generateTokens(user: any): { accessToken: string; refreshToken: string } {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets not configured');
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      jwtRefreshSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }
}
