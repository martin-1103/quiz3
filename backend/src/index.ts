import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from '@/routes/auth';
import questionRoutes from '@/routes/questions';
import quizRoutes from '@/routes/quizzes';
import aiRoutes from '@/routes/ai';
import analyticsRoutes from '@/routes/analytics';

// Import middleware
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { securityMiddleware } from '@/middleware/security';

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet());
app.use(securityMiddleware);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Basic middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/questions`, questionRoutes);
app.use(`${API_PREFIX}/quizzes`, quizRoutes);
app.use(`${API_PREFIX}/ai`, aiRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    server.listen(PORT, () => {
      console.log(`🚀 Quiz Platform Backend Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

export default app;
