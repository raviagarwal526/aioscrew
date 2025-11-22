/**
 * Express server for AI agent backend
 */

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import agentRoutes from './api/routes/agents.js';

// Load environment variables
config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (for Railway)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/agents', agentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Aioscrew AI Agent Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      agentHealth: '/api/agents/health',
      validate: 'POST /api/agents/validate',
      validateClaim: 'POST /api/agents/validate-claim'
    }
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server - bind to 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'your-app.up.railway.app'}`
    : `http://localhost:${PORT}`;

  console.log('\n🚀 Aioscrew AI Agent Backend');
  console.log('================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 API: ${baseUrl}`);
  console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🤖 Agents: Flight Time, Premium Pay, Compliance`);
  console.log(`🔑 Claude API: ${process.env.ANTHROPIC_API_KEY ? 'Configured ✓' : 'Missing ✗'}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected ✓' : 'Missing ✗'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('================================\n');
});

export default app;
