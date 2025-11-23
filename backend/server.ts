/**
 * Express server for AI agent backend
 */

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import agentRoutes from './api/routes/agents.js';
import adminRoutes from './api/routes/admin.js';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

const PORT = parseInt(process.env.PORT || '3001', 10);

// Export io for use in other modules
export { io };

// Health check endpoint FIRST - before any middleware that could block it
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Request timeout (2 minutes for AI agent processing)
app.use((req, res, next) => {
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
});

// Request logging with timing
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const start = Date.now();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// API Routes
app.use('/api/agents', agentRoutes);
app.use('/api/admin', adminRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 WebSocket client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 WebSocket client disconnected: ${socket.id}`);
  });

  // Join admin room for agent activity updates
  socket.on('join:admin', () => {
    socket.join('admin');
    console.log(`👤 Client ${socket.id} joined admin room`);
  });

  // Leave admin room
  socket.on('leave:admin', () => {
    socket.leave('admin');
    console.log(`👤 Client ${socket.id} left admin room`);
  });
});

// Serve static frontend files from /public directory
const publicPath = path.join(__dirname, '..', 'public');
console.log(`📁 Serving static files from: ${publicPath}`);
app.use(express.static(publicPath));

// Catch-all route to serve index.html for client-side routing (SPA support)
// This MUST come after API routes to ensure API endpoints are not overridden
app.get('*', (req, res, next) => {
  // Skip API routes and health check - let them fall through to 404 if not matched
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return next();
  }

  // Serve index.html for all other routes (client-side routing)
  res.sendFile(path.join(publicPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);

  // Prevent sending response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Start server - bind to 0.0.0.0 for Railway
httpServer.listen(PORT, '0.0.0.0', () => {
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
  console.log(`🔌 WebSocket: Enabled for real-time updates`);
  console.log(`🔑 Claude API: ${process.env.ANTHROPIC_API_KEY ? 'Configured ✓' : 'Missing ✗'}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected ✓' : 'Missing ✗'}`);
  console.log(`📊 Neo4j: ${process.env.NEO4J_URI ? 'Configured ✓' : 'Missing ✗'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('================================');
  console.log(`✅ Server is listening and ready to accept connections\n`);
});

// Handle server errors
httpServer.on('error', (error: NodeJS.ErrnoException) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(async () => {
    try {
      const { closeNeo4jDriver } = await import('./services/neo4j-service.js');
      await closeNeo4jDriver();
      console.log('✅ Server closed gracefully');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  httpServer.close(async () => {
    try {
      const { closeNeo4jDriver } = await import('./services/neo4j-service.js');
      await closeNeo4jDriver();
      console.log('✅ Server closed gracefully');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
});

export default app;
