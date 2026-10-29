import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

/**
 * Validate essential environment variables at server startup
 */
const validateEnvironment = () => {
  const requiredVars = ['JWT_SECRET'];
  const missing = requiredVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Critical Error: Missing required environment variable(s): ${missing.join(', ')}`);
    console.error('Please configure them in server/.env before starting the server.');
    process.exit(1);
  }
};

validateEnvironment();

const app = express();

// 1. Security HTTP Headers via Helmet
app.use(helmet());

// 2. Cross-Origin Resource Sharing (CORS)
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: frontendOrigin, // Strict origin matching (no wildcard with credentials)
    credentials: true, // Allow cookies to be sent across origins
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
  })
);

// 3. Body parsers and cookie parser
app.use(express.json({ limit: '10kb' })); // Mitigates large payload DoS attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 4. Application Health Check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus
  });
});

// 5. Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 6. Centralized Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start HTTP server only if executed directly (e.g. node server.js), not when imported by test runners
const currentFile = fileURLToPath(import.meta.url);
const executedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';
const isDirectExecution = executedFile === currentFile;

const PORT = process.env.PORT || 5000;
if (isDirectExecution && process.env.NODE_ENV !== 'test') {
  connectDB();
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Authentication Server running in [${process.env.NODE_ENV || 'development'}] mode`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Allowed Frontend: ${frontendOrigin}`);
    console.log(`======================================================\n`);
  });
}

// Export express app for automated testing
export default app;
