import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let details: any = undefined;

  // Log the error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle specific error types
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma errors
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Resource already exists';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Foreign key constraint failed';
        break;
      default:
        statusCode = 500;
        message = 'Database error';
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
    details = undefined;
  }

  const response: ApiResponse = {
    success: false,
    error: message,
    message: statusCode < 500 ? message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  };
  
  res.status(404).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
