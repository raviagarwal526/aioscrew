# Aioscrew Setup Guide - Backend Integration

## Overview

This guide will help you set up the complete Aioscrew system with real AI agents from dCortex, powered by Claude Sonnet 4.5 and LangGraph orchestration.

**What's New:**
- ✅ Backend API server with Express
- ✅ 3 real AI agents (Flight Time, Premium Pay, Compliance)
- ✅ LangGraph orchestration
- ✅ Integration with Neon PostgreSQL
- ✅ Frontend automatically calls backend when available

---

## Prerequisites

1. **Anthropic API Key**
   - Sign up at https://console.anthropic.com
   - Create a new API key
   - Save it for later

2. **Database Connection**
   - You should already have `VITE_DATABASE_URL` in your frontend `.env`
   - We'll reuse this for the backend

---

## Step-by-Step Setup

### 1. Frontend Setup (Already Done)

Your frontend is already built and ready. Just make sure dependencies are installed:

```bash
npm install
```

### 2. Backend Setup (New!)

#### A. Navigate to backend directory
```bash
cd backend
```

#### B. Dependencies are already installed
The backend dependencies were installed during setup:
- @anthropic-ai/sdk (Claude API)
- @langchain/langgraph (Agent orchestration)
- express (Web server)
- @neondatabase/serverless (Database)

#### C. Configure environment variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your keys
nano .env  # or use your preferred editor
```

**Required variables:**
```env
# Get this from https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-api03-xxx

# Copy from your frontend .env file (VITE_DATABASE_URL)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/aioscrew

# These are already set correctly
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Start Both Servers

#### Terminal 1 - Backend (from /backend directory)
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Aioscrew AI Agent Backend
================================
📡 Server running on port 3001
🌐 API: http://localhost:3001
🔗 Frontend: http://localhost:5173
🤖 Agents: Flight Time, Premium Pay, Compliance
🔑 Claude API: Configured ✓
💾 Database: Connected ✓
================================
```

#### Terminal 2 - Frontend (from root directory)
```bash
npm run dev
```

You should see:
```
  VITE v5.4.2  ready in 543 ms

  ➜  Local:   http://localhost:5173/
```

### 4. Test the Integration

#### A. Check Backend Health
```bash
curl http://localhost:3001/api/agents/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-22T...",
  "agents": [
    "orchestrator",
    "flight-time-calculator",
    "premium-pay-calculator",
    "compliance-validator"
  ]
}
```

#### B. Test AI Validation
```bash
curl -X POST http://localhost:3001/api/agents/validate \
  -H "Content-Type: application/json" \
  -d '{"claimId":"CLM-2024-1156"}'
```

This will:
1. Fetch claim CLM-2024-1156 from database
2. Run it through 3 AI agents
3. Return detailed validation result

**Expected:** Response in ~3-5 seconds with agent results

#### C. Use the UI
1. Open http://localhost:5173 in your browser
2. Navigate to **Payroll with Agents** page
3. Watch the claims process through real AI agents!
4. Click on any claim to see:
   - Agent timeline
   - Confidence scores
   - Contract references
   - Detailed reasoning

**You'll see in browser console:**
```
Backend API: Available ✓
Calling real AI agents for claim CLM-2024-1156...
✓ Real AI validation complete: approved
```

---

## How It Works

### Architecture Flow

```
Frontend (React)
    ↓
    POST /api/agents/validate-claim
    ↓
Backend (Express)
    ↓
LangGraph Orchestrator
    ↓
    ├─→ Flight Time Calculator (Claude API)
    ├─→ Premium Pay Calculator (Claude API)
    └─→ Compliance Validator (Claude API)
    ↓
    Aggregates Results
    ↓
    Returns to Frontend
    ↓
UI displays timeline, confidence, issues
```

### Agent Processing Flow

1. **Flight Time Calculator** (0.8s)
   - Queries database for trip data
   - Verifies flight exists
   - Validates times are accurate
   - Returns: validated ✓/✗ + confidence

2. **Premium Pay Calculator** (0.9s)
   - Analyzes claim type
   - Looks up CBA rules
   - Calculates correct amount
   - Returns: amount correct ✓/✗ + contract section

3. **Compliance Validator** (1.2s)
   - Checks for duplicates in DB
   - Analyzes historical patterns
   - Fraud detection
   - Returns: issues[] + fraud risk level

4. **Final Decision** (0.1s)
   - Aggregates all results
   - Calculates overall confidence
   - Makes approve/flag/reject decision

**Total:** ~3-4 seconds per claim

---

## Project Structure

```
aioscrew/
├── frontend (React + Vite)
│   ├── src/
│   │   ├── components/agents/        # UI components for agents
│   │   ├── services/
│   │   │   ├── agentService.ts       # ✅ Updated: calls real backend
│   │   │   └── api-client.ts         # ✅ New: HTTP client
│   │   ├── types/agents.ts           # Agent type definitions
│   │   └── views/
│   │       └── PayrollViewWithAgents.tsx
│   ├── package.json
│   └── .env                          # Frontend env vars
│
└── backend/                          # ✅ NEW DIRECTORY
    ├── agents/
    │   ├── core/
    │   │   ├── flight-time-calculator.ts   # ✅ Real Claude agent
    │   │   ├── premium-pay-calculator.ts   # ✅ Real Claude agent
    │   │   ├── compliance-validator.ts     # ✅ Real Claude agent
    │   │   └── orchestrator.ts             # ✅ LangGraph orchestration
    │   └── shared/
    │       ├── types.ts                    # Backend types
    │       └── claude-client.ts            # Claude API wrapper
    ├── api/
    │   └── routes/
    │       └── agents.ts                   # Express routes
    ├── services/
    │   └── database-service.ts             # Neon DB queries
    ├── server.ts                           # Express app
    ├── package.json
    ├── .env                                # Backend env vars
    └── README.md                           # Backend docs
```

---

## Troubleshooting

### Backend won't start

**Error:** `ANTHROPIC_API_KEY is undefined`
```bash
# Make sure you created backend/.env
cd backend
cp .env.example .env
# Then edit .env and add your key
```

**Error:** `Database connection failed`
```bash
# Copy DATABASE_URL from frontend .env to backend .env
# Make sure there are no extra spaces or quotes
```

### Frontend shows "Using mock data"

**Check:**
1. Is backend running? `curl http://localhost:3001/api/agents/health`
2. Check browser console for errors
3. Make sure backend is on port 3001
4. Try restarting both servers

### Agents return errors

**Check backend logs:**
```bash
# In backend terminal, you'll see:
🔍 Running Flight Time Calculator...
❌ FlightTimeCalculator error: Invalid API key

# Fix: Check your ANTHROPIC_API_KEY in backend/.env
```

### Slow response times

**Normal:** 3-5 seconds per claim
**Slow (>10s):** Check your internet connection or Anthropic API status

---

## Cost Estimate

Using Claude Sonnet 4.5:
- **Input:** ~$3 per million tokens
- **Output:** ~$15 per million tokens

Per claim:
- Input: ~1,000 tokens ($0.003)
- Output: ~600 tokens ($0.009)
- **Total:** ~$0.012 per claim

**100 claims/day:** ~$1.20/day = $36/month

---

## Next Steps

### Immediate Testing
1. ✅ Process the 5 sample claims in the UI
2. ✅ Check agent timeline and confidence scores
3. ✅ Verify contract references appear
4. ✅ Test flagged claims (Per Diem with high amount)

### Before Copa Demo (Dec 15)
1. **Add more agents:**
   - Per Diem Calculator
   - Duty Time Monitor
   - Guarantee Calculator

2. **Neo4j Integration:**
   - Set up Neo4j AuraDB
   - Load CBA contract sections
   - Update agents to query contract graph

3. **More test data:**
   - Add 100+ claims to database
   - Vary claim types and amounts
   - Include fraud scenarios

4. **WebSocket real-time updates:**
   - Show agents processing live
   - Progress bars for each agent
   - Live activity feed

5. **Deployment:**
   - Frontend: Vercel
   - Backend: Railway or Render
   - Database: Already on Neon ✓

---

## Development Workflow

### Making Changes to Agents

1. **Edit agent prompt** in `backend/agents/core/[agent-name].ts`
2. Server auto-restarts (tsx watch)
3. Test in frontend immediately
4. Check backend logs for agent output

### Adding a New Agent

See `backend/README.md` for detailed guide

Quick version:
1. Create `backend/agents/core/my-agent.ts`
2. Add to `orchestrator.ts` graph
3. Update frontend types if needed

### Debugging Agent Behavior

Backend logs show:
```
🔍 Running Flight Time Calculator...
💰 Running Premium Pay Calculator...
🛡️ Running Compliance Validator...
⚖️ Making final decision...
📊 Decision: APPROVED
🎯 Confidence: 95.3%
```

Plus full Claude API responses for debugging

---

## Getting Help

- **Backend Issues:** Check `backend/README.md`
- **Frontend Issues:** Check original docs
- **Agent Behavior:** Review agent system prompts
- **Database Issues:** Check Neon PostgreSQL console

---

## Summary

You now have:
- ✅ Real AI agents from dCortex powered by Claude Sonnet 4.5
- ✅ LangGraph orchestration
- ✅ Backend API server
- ✅ Frontend integration with fallback to mocks
- ✅ Database integration
- ✅ Complete claim validation pipeline

**Ready for Copa Airlines demo!** 🚀
