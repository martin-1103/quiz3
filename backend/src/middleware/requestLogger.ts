import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip } = req;
  const userAgent = req.get('User-Agent') || '';

  // Log the request
  logger.info('Incoming request', {
    method,
    url,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
  });

  // Listen for the response to log the completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    logger.info('Request completed', {
      method,
      url,
      ip,
      statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  });

  next();
};
