# Aioscrew - Quick Start Guide

This guide will help you set up and start your Aioscrew project in minutes.

## 📋 Prerequisites

Before you begin, make sure you have:

1. **Node.js 20+** installed

   ```bash
   node --version  # Should be v20 or higher
   ```

2. **PostgreSQL Database** (or Neon account)

   - Sign up at https://neon.tech (free tier available)
   - Or use local PostgreSQL

3. **API Keys** (at least one):

   - **Anthropic API Key** (recommended) - https://console.anthropic.com
   - **OpenAI API Key** (optional) - https://platform.openai.com
   - **Groq API Key** (optional, free) - https://console.groq.com (for free Ollama alternative)

4. **Ollama** (optional but recommended for cost savings)
   - Download from https://ollama.ai
   - See [OLLAMA_SETUP.md](./OLLAMA_SETUP.md) for details

---

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd aioscrew

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Configure Environment Variables

#### A. Backend Configuration

Create `backend/.env` file:

```bash
cd backend
# Create .env file (copy from example if it exists, or create new)
```

Add the following to `backend/.env`:

```env
# Required: Database Connection
DATABASE_URL=postgresql://user:password@host:port/database
# Example for Neon: postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/aioscrew

# Required: At least one AI API key
ANTHROPIC_API_KEY=sk-ant-api03-xxx
# Optional: OpenAI API key
OPENAI_API_KEY=sk-proj-xxx
# Optional: Groq API key (free alternative to Ollama)
GROQ_API_KEY=gsk_xxx

# Optional: Ollama Configuration (for local free LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest

# Optional: Neo4j Configuration (for CBA contract graph)
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password
NEO4J_DATABASE=neo4j

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### B. Frontend Configuration

Create `.env` file in the root directory:

```bash
# In root directory (aioscrew/)
```

Add the following to `.env`:

```env
# Required: Database Connection
VITE_DATABASE_URL=postgresql://user:password@host:port/database
# Example for Neon: postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/aioscrew

# Required: Backend API URL
VITE_API_URL=http://localhost:3001
```

### Step 3: Set Up Database

#### Option A: Using Neon (Recommended for Development)

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Add it to both `backend/.env` (as `DATABASE_URL`) and `.env` (as `VITE_DATABASE_URL`)

#### Option B: Using Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb aioscrew
   ```
3. Use connection string: `postgresql://localhost:5432/aioscrew`

#### Run Database Migrations

**Important:** You must run migrations to create all database tables.

```bash
cd backend
npm run migrate
```

This will:

- ✅ Create all admin tables (claims, payments, admin users)
- ✅ Create all crew scheduling tables (qualifications, rosters, disruptions)
- ✅ Create indexes and views
- ✅ Insert default configuration

**See [DATABASE_MIGRATIONS.md](./DATABASE_MIGRATIONS.md) for detailed migration guide.**

### Step 4: Start the Application

You need **two terminal windows** running simultaneously:

#### Terminal 1: Backend Server

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

#### Terminal 2: Frontend Server

```bash
# From root directory
npm run dev
```

You should see:

```
  VITE v5.4.2  ready in 543 ms

  ➜  Local:   http://localhost:5173/
```

### Step 5: Verify Installation

1. **Check Backend Health:**

   ```bash
   curl http://localhost:3001/api/agents/health
   ```

   Expected response:

   ```json
   {
     "status": "healthy",
     "timestamp": "2024-...",
     "agents": ["orchestrator", "flight-time-calculator", ...]
   }
   ```

2. **Open Frontend:**

   - Navigate to http://localhost:5173 in your browser
   - You should see the Aioscrew dashboard

3. **Test AI Validation:**
   - Navigate to "Payroll Admin" role
   - Click "Start AI Validation" on a claim
   - Watch the multi-agent system process the claim

---

## 🎯 Quick Commands Reference

```bash
# Install all dependencies
npm install && cd backend && npm install && cd ..

# Start backend (from backend directory)
cd backend && npm run dev

# Start frontend (from root directory)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run typecheck
```

---

## 🔧 Troubleshooting

### Backend won't start

**Error: `ANTHROPIC_API_KEY is undefined`**

- Make sure `backend/.env` exists and contains `ANTHROPIC_API_KEY`

**Error: `Database connection failed`**

- Verify `DATABASE_URL` in `backend/.env` is correct
- Check if your database is accessible
- For Neon: Ensure the connection string is complete

**Error: `Port 3001 already in use`**

- Change `PORT` in `backend/.env` to a different port
- Update `VITE_API_URL` in root `.env` to match

### Frontend shows "Using mock data"

**Check:**

1. Is backend running? Test: `curl http://localhost:3001/api/agents/health`
2. Is `VITE_API_URL` set correctly in root `.env`?
3. Check browser console for errors
4. Ensure CORS is configured (backend should allow `http://localhost:5173`)

### Slow AI responses

**Normal:** 3-5 seconds per claim validation
**Slow (>10s):**

- Check your internet connection
- Verify API keys are valid
- Consider using Ollama for faster local inference (see [OLLAMA_SETUP.md](./OLLAMA_SETUP.md))

### Database errors

**Error: `relation does not exist`**

- Run database migrations from `backend/migrations/` directory
- Check that tables are created in your database

---

## 📚 Additional Resources

- **[Full Setup Guide](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[Ollama Setup](./OLLAMA_SETUP.md)** - Save money with free local LLM
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[AI Architecture](./AI_ARCHITECTURE.md)** - Understanding the multi-agent system
- **[Railway Deployment](./RAILWAY_DEPLOYMENT.md)** - Deploy to production

---

## 🎉 You're Ready!

Once both servers are running:

- ✅ Backend: http://localhost:3001
- ✅ Frontend: http://localhost:5173

Navigate to the frontend and start exploring the AI-powered crew management system!

---

## 💡 Tips

1. **Save Money:** Set up Ollama for free local LLM inference (see [OLLAMA_SETUP.md](./OLLAMA_SETUP.md))
2. **Development:** Use Groq API (free tier) as an alternative to Ollama
3. **Production:** Use Anthropic Claude for best quality
4. **Database:** Neon free tier is perfect for development
5. **Monitoring:** Check backend terminal for agent execution logs

---

## 🆘 Need Help?

- Check the troubleshooting section above
- Review the detailed documentation files
- Check backend logs for specific error messages
- Verify all environment variables are set correctly

**Happy coding! 🚀**
