# Railway Configuration Guide

## Critical Configuration Steps

### 1. Set Root Directory
In Railway's service settings, you **MUST** set the **Root Directory** to `backend`:

1. Go to your Railway project dashboard
2. Click on the backend service
3. Go to **Settings** tab
4. Find **Root Directory** setting
5. Set it to: `backend`
6. Click **Save**

### 2. Verify Environment Variables
Ensure these are set in Railway:
- `NODE_ENV=production`
- `PORT` (auto-set by Railway to 8080)
- `ANTHROPIC_API_KEY` - Your Claude API key
- `DATABASE_URL` - Your Neon database connection string
- `RAILWAY_PUBLIC_DOMAIN` (auto-set by Railway)

### 3. Deployment Method
Railway will automatically detect and use the Dockerfile in the backend directory.

### 4. Health Check
The server provides two health check endpoints:
- `/health` - Simple health check (recommended)
- `/api/agents/health` - Detailed agent health check

### 5. Troubleshooting 502 Errors

If you see 502 Bad Gateway errors:

1. **Check Root Directory**: Ensure it's set to `backend` in Railway settings
2. **Check Logs**: Look for any startup errors in Deploy Logs
3. **Verify Port**: Ensure server is binding to `0.0.0.0:$PORT`
4. **Test Health Endpoint**: Try accessing `/health` directly

### 6. Expected Startup Logs

You should see:
```
🚀 Aioscrew AI Agent Backend
================================
📡 Server running on port 8080
🌐 API: https://your-app.up.railway.app
🤖 Agents: Flight Time, Premium Pay, Compliance
🔑 Claude API: Configured ✓
💾 Database: Connected ✓
🌍 Environment: production
================================
✅ Server is listening and ready to accept connections
```

### 7. Testing Deployment

Once deployed, test these endpoints:
- `GET /health` - Should return 200 OK
- `GET /` - Should return API information
- `GET /api/agents/health` - Should return agent status
