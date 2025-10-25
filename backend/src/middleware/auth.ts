import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { ApiResponse } from '@/types';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: 'Access token required',
        message: 'Please provide a valid access token',
        timestamp: new Date().toISOString(),
      };
      res.status(401).json(response);
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Add user info to request object (you might want to fetch full user from DB)
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as any,
    } as User;

    next();
  } catch (error) {
    let errorMessage = 'Invalid token';
    
    if (error instanceof jwt.TokenExpiredError) {
      errorMessage = 'Token expired';
    } else if (error instanceof jwt.JsonWebTokenError) {
      errorMessage = 'Invalid token format';
    }

    const response: ApiResponse = {
      success: false,
      error: errorMessage,
      message: 'Please login again to continue',
      timestamp: new Date().toISOString(),
    };
    
    res.status(401).json(response);
    return;
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
        message: 'Please login to access this resource',
        timestamp: new Date().toISOString(),
      };
      res.status(401).json(response);
      return;
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource',
        timestamp: new Date().toISOString(),
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role as any,
        } as User;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};
