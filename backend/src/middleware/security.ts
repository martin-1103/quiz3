import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types';

// General rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please try again later',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts',
    message: 'Please try again later',
    timestamp: new Date().toISOString(),
  },
  skipSuccessfulRequests: true,
});

// Rate limiting for AI endpoints
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 AI requests per hour
  message: {
    success: false,
    error: 'AI request limit exceeded',
    message: 'Please try again later',
    timestamp: new Date().toISOString(),
  },
});

// Security middleware for general security
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Log suspicious requests
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempt
    /union.*select/i,  // SQL injection attempt
    /javascript:/i,  // JavaScript protocol
  ];

  const url = req.url.toLowerCase();
  const userAgent = req.get('User-Agent') || '';

  if (suspiciousPatterns.some(pattern => pattern.test(url)) || 
      suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    console.warn('Suspicious request detected:', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    
    const response: ApiResponse = {
      success: false,
      error: 'Bad request',
      message: 'Invalid request format',
      timestamp: new Date().toISOString(),
    };
    
    return res.status(400).json(response);
  }

  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && 
      !req.url.includes('/api/v1/ai/') && 
      !req.is('application/json')) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid content type',
      message: 'Content-Type must be application/json',
      timestamp: new Date().toISOString(),
    };
    
    return res.status(400).json(response);
  }

  next();
};

// CORS middleware
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const origin = req.get('Origin');

  if (allowedOrigins.includes(origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // Check for oversized requests
  const contentLength = req.get('Content-Length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    const response: ApiResponse = {
      success: false,
      error: 'Request too large',
      message: 'Request size exceeds maximum allowed limit',
      timestamp: new Date().toISOString(),
    };
    
    return res.status(413).json(response);
  }

  // Validate JSON body for relevant methods
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    try {
      // Ensure it's valid JSON and not too nested
      const jsonString = JSON.stringify(req.body);
      if (jsonString.length > 1024 * 1024) { // 1MB JSON limit
        throw new Error('JSON payload too large');
      }
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid JSON',
        message: 'Request body contains invalid JSON',
        timestamp: new Date().toISOString(),
      };
      
      return res.status(400).json(response);
    }
  }

  next();
};
