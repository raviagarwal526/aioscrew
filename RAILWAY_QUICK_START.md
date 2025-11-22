# Railway Deployment - Quick Reference

## Your Architecture

```
┌─────────────────────────────────────────┐
│         Railway Project                 │
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │───>│   Backend    │  │
│  │  (React)     │    │  (Express)   │  │
│  │              │    │              │  │
│  │  Port: auto  │    │  Port: 3001  │  │
│  └──────────────┘    └──────────────┘  │
│         │                    │          │
└─────────┼────────────────────┼──────────┘
          │                    │
          ├────────────────────┘
          │
          ▼
    ┌─────────────┐
    │    Neon     │
    │ PostgreSQL  │
    └─────────────┘
```

## 2 Services Required

### Service 1: Backend
- **Name:** `aioscrew-backend`
- **Root Directory:** `backend`
- **Port:** 3001
- **Health Check:** `/api/agents/health`

### Service 2: Frontend
- **Name:** `aioscrew-frontend`
- **Root Directory:** `/` (root)
- **Port:** Auto-assigned by Railway

## Environment Variables

### Backend Service
```env
# Required
ANTHROPIC_API_KEY=sk-ant-xxx

# From Railway Variables (use Railway's built-in references)
DATABASE_URL=${{Neon.DATABASE_URL}}
FRONTEND_URL=${{aioscrew-frontend.url}}

# Auto-set by Railway
PORT=${{PORT}}
NODE_ENV=production
```

### Frontend Service
```env
# From Railway Variables
VITE_DATABASE_URL=${{Neon.DATABASE_URL}}
VITE_API_URL=${{aioscrew-backend.url}}
```

## Deployment Order

1. ✅ **Deploy Backend First**
   - Add ANTHROPIC_API_KEY
   - Add DATABASE_URL (from Neon)
   - Deploy and wait for URL

2. ✅ **Deploy Frontend Second**
   - Add VITE_API_URL (backend URL from step 1)
   - Add VITE_DATABASE_URL
   - Deploy

3. ✅ **Update Backend**
   - Go back to backend service
   - Set FRONTEND_URL to frontend URL from step 2
   - Redeploy

## Testing Deployment

### Test Backend
```bash
# Health check
curl https://aioscrew-backend.up.railway.app/api/agents/health

# Expected:
{
  "status": "healthy",
  "agents": ["orchestrator", "flight-time-calculator", ...]
}
```

### Test Frontend
```bash
# Open in browser
https://aioscrew-frontend.up.railway.app

# Check browser console:
"Backend API: Available ✓"
```

## Monitoring

### Backend Logs
```
🚀 Aioscrew AI Agent Backend
📡 Server running on port 3001
🔑 Claude API: Configured ✓
💾 Database: Connected ✓
```

### Frontend Logs
```
VITE v5.4.2 preview
➜  Local:   http://0.0.0.0:XXXX/
```

## Common Issues

### Issue: "Backend API: Using mock data ✗"
**Fix:** Check VITE_API_URL in frontend service points to correct backend URL

### Issue: "CORS error"
**Fix:** Check FRONTEND_URL in backend service matches your frontend URL

### Issue: "Database connection failed"
**Fix:** Verify DATABASE_URL is set correctly in both services

## Cost Estimate

**Railway Pricing:**
- Each service: ~$5/month (hobby plan)
- **Total:** ~$10/month for both services

**Plus:**
- Neon DB: Free tier (already have)
- Anthropic API: ~$36/month (100 claims/day)

**Grand Total:** ~$46/month for full production deployment

## Next Steps

1. Set up Railway account if not already
2. Create project with 2 services
3. Connect GitHub repo to both
4. Configure environment variables
5. Deploy!

See full guide in RAILWAY_DEPLOYMENT.md
