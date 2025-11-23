# Aioscrew - Airline Crew Operating System

**Powered by AI from dCortex**

An enterprise-grade crew management platform featuring sophisticated multi-agent AI systems for automated claim validation, compliance monitoring, and intelligent decision-making.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Railway Deploy](https://img.shields.io/badge/Railway-Deployed-success)](https://aioscrew-backend-production.up.railway.app/)
[![AI Architecture](https://img.shields.io/badge/AI-Multi--LLM%20Architecture-blue)](./ AI_ARCHITECTURE.md)

---

## 🌟 What Makes This Special

This isn't just another automation tool. Aioscrew demonstrates **enterprise-grade AI architecture** with:

- **🧠 Multi-LLM Strategy** - Intelligent routing between Ollama (local), GPT-4o, Claude Sonnet, and Claude Opus based on task complexity
- **🏗️ Hierarchical Agents** - Parent agents dynamically delegate to specialized sub-agents
- **💰 Cost Optimization** - Up to 100% cost savings with Ollama local LLM, or 66% savings through intelligent cloud routing
- **⚡ Parallel Execution** - 3x faster processing (20s vs 60s) via concurrent agent orchestration
- **🎯 Educational UX** - Visual pipeline showing which AI does what and why
- **📊 Transparent Reasoning** - See every decision the AI makes in real-time

---

## 🚀 Live Demo

**Production:** [https://aioscrew-backend-production.up.railway.app/](https://aioscrew-backend-production.up.railway.app/)

**Try it:**
1. Select **"Payroll Admin"** role
2. Click **"Start AI Validation"**
3. Watch the multi-agent system validate claims in real-time
4. Explore the **Technology Selection Matrix** at the bottom

---

## 📋 Table of Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture Highlights](#architecture-highlights)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Cost Analysis](#cost-analysis)
- [Contributing](#contributing)

---

## ✨ Key Features

### AI Agent System
- ✅ **Real-time claim validation** in 15-20 seconds (3x faster than sequential)
- ✅ **Multi-LLM architecture** - Ollama (local), GPT-4o-mini, Claude Sonnet, Claude Opus, Rules Engines
- ✅ **FREE local inference** - Ollama prioritized first for zero-cost operations
- ✅ **Hierarchical orchestration** - Agents calling specialized sub-agents
- ✅ **Parallel execution** - All agents run simultaneously
- ✅ **Visual pipeline** - See agents working in real-time with timeline visualization
- ✅ **Educational interface** - "Why AI?" explanations for business stakeholders

### Business Intelligence
- ✅ **Automated compliance** checking against CBA contracts
- ✅ **Fraud detection** through historical pattern analysis
- ✅ **Cost optimization** - 66% savings vs single-LLM approach
- ✅ **Transparent decisions** - Full audit trail of AI reasoning
- ✅ **Confidence scoring** - Know when to trust vs escalate

### User Experience
- ✅ **Multi-role dashboards** - Crew, Scheduler, Controller, Payroll, Management, Union
- ✅ **Manual AI control** - Button to trigger validation (not auto-run)
- ✅ **Technology selection matrix** - Shows which tech solves which problem
- ✅ **Real-time progress** - Strikethrough completed steps like chat UX
- ✅ **Hierarchical sub-agents** - See nested agent execution

---

## 🛠️ Technology Stack

### Frontend
- **React 18** + **TypeScript** - Type-safe UI components
- **Vite** - Lightning-fast development
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Beautiful, consistent icons

### Backend
- **Node.js 20** + **Express** - High-performance API
- **TypeScript** - End-to-end type safety
- **Multi-LLM Integration:**
  - **Ollama** (Priority 0) - FREE local GPU inference, always tried first
  - **Anthropic Claude** (Sonnet 4.5, Opus) - Complex reasoning, legal analysis
  - **OpenAI GPT-4o-mini** - Fast calculations, structured tasks
  - **Native Rules Engine** - Deterministic logic (free, <100ms)

### Database & Infrastructure
- **Neon PostgreSQL** - Serverless, auto-scaling database
- **Railway** - Production deployment platform
- **Docker** - Containerized deployment
- **GitHub Actions** - CI/CD pipeline (future)

### AI Orchestration
- **Custom Multi-Agent System** - Parallel execution, hierarchical delegation
- **LangGraph** (future) - Stateful agent workflows
- **Vector Search** (future) - Historical precedent lookup

---

## 🏗️ Architecture Highlights

### Multi-Agent Orchestration

```
Orchestrator (Claude Sonnet 4.5)
├── Flight Time Calculator (GPT-4o-mini)
│   └── Fast, cheap calculations
├── Premium Pay Calculator (Claude Sonnet 4.5)
│   └── Complex contract reasoning
└── Compliance Validator (Claude Opus)
    ├── Contract Interpreter (Claude Opus)
    │   └── Legal language analysis
    ├── Historical Precedent (GPT-4o + Vector DB)
    │   └── Past case lookup
    └── Union Rules Checker (Rules Engine)
        └── Fast compliance checks
```

**Why this works:**
- **Parallel execution** - All top-level agents run simultaneously
- **Hierarchical delegation** - Complex agents call specialists
- **Optimal technology** - Each agent uses the right LLM for its task
- **Cost-effective** - 66% cheaper than using only Claude Opus

[📚 Read full architecture documentation](./AI_ARCHITECTURE.md)

---

## 🎯 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL (or Neon account)
- **Ollama** (recommended for FREE local inference) - [Setup Guide](./OLLAMA_SETUP.md)
- Anthropic API key (fallback for complex tasks)
- OpenAI API key (optional, for GPT-4o-mini)

### Installation

```bash
# Clone repository
git clone https://github.com/jbandu/aioscrew.git
cd aioscrew

# Install dependencies
npm install
cd backend && npm install && cd ..

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys and database URL

# Start development
npm run dev  # Frontend (port 5173)
cd backend && npm run dev  # Backend (port 3001)
```

### Environment Variables

```bash
# 🚀 Ollama (FREE local LLM - Recommended!)
OLLAMA_BASE_URL=http://localhost:11434  # Local Ollama server
OLLAMA_MODEL=llama3.2:latest            # Model to use

# Multi-LLM Configuration (Fallbacks)
ANTHROPIC_API_KEY=sk-ant-xxx  # Required for complex tasks
OPENAI_API_KEY=sk-proj-xxx     # Optional (for GPT-4o-mini)
GOOGLE_API_KEY=AIzaSy-xxx      # Optional (future Gemini support)
XAI_API_KEY=xai-xxx            # Optional (future Grok support)

# Database
DATABASE_URL=postgresql://...   # Neon or local PostgreSQL

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

[📚 Complete setup guide](./SETUP_GUIDE.md)
[🚀 Ollama setup guide](./OLLAMA_SETUP.md) ⭐ **Save $100+/month on API costs!**

---

## 📚 Documentation

### Core Documentation
- **[AI Architecture](./AI_ARCHITECTURE.md)** ⭐ - Multi-LLM strategy, hierarchical agents, cost analysis
- **[Ollama Setup](./OLLAMA_SETUP.md)** 🚀 - FREE local LLM setup (save $100+/month!)
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete REST API reference
- **[Railway Deployment](./RAILWAY_DEPLOYMENT.md)** - Production deployment guide
- **[Setup Guide](./SETUP_GUIDE.md)** - Development environment setup

### Technical Deep-Dives
- **[Multi-LLM Configuration](./backend/agents/config/llm-provider-config.ts)** - LLM routing logic
- **[Agent Implementation](./backend/agents/core/)** - Agent source code
- **[Technology Selection Matrix](./src/components/agents/TechnologySelectionMatrix.tsx)** - Visual decision framework

---

## 🔌 API Reference

### Quick Example

```bash
# Validate a claim
curl -X POST https://aioscrew-backend-production.up.railway.app/api/agents/validate \
  -H "Content-Type: application/json" \
  -d '{"claimId": "CLM-2024-1156"}'
```

### Response

```json
{
  "claimId": "CLM-2024-1156",
  "overallStatus": "approved",
  "confidence": 0.92,
  "processingTime": 18.5,
  "recommendation": "APPROVE - All validation checks passed",
  "agentResults": [
    {
      "agentType": "flight-time",
      "status": "completed",
      "duration": 2.3,
      "summary": "Flight time validated: 8.4 hours"
    },
    {
      "agentType": "premium-pay",
      "status": "completed",
      "duration": 5.2,
      "summary": "Premium pay approved: $125"
    },
    {
      "agentType": "compliance",
      "status": "completed",
      "duration": 11.0,
      "summary": "No compliance violations found"
    }
  ]
}
```

[📚 Full API documentation](./API_DOCUMENTATION.md)

---

## 🚢 Deployment

### Railway (Recommended)

```bash
# One-click deploy
https://railway.app/new/template/aioscrew

# Or manual deploy
railway login
railway init
railway up
```

### Docker

```bash
# Build
docker build -t aioscrew -f backend/Dockerfile .

# Run
docker run -p 8080:8080 \
  -e ANTHROPIC_API_KEY=xxx \
  -e DATABASE_URL=xxx \
  aioscrew
```

[📚 Complete deployment guide](./RAILWAY_DEPLOYMENT.md)

---

## 💰 Cost Analysis

### Per-Claim Cost Breakdown

| Component | Technology | Cost | Calls | Total |
|-----------|------------|------|-------|-------|
| Flight Time | GPT-4o-mini | $0.0001 | 1 | $0.0001 |
| Premium Pay | Claude Sonnet | $0.003 | 1 | $0.003 |
| Compliance | Claude Opus | $0.005 | 1 | $0.005 |
| Sub-agents | Mixed | $0.002 | ~1 | $0.002 |
| Orchestrator | Claude Sonnet | $0.002 | 1 | $0.002 |
| **TOTAL** | | | | **$0.012** |

### Cost Comparison

| Approach | Cost/Claim | Cost/1000 | Annual (10K/month) |
|----------|-----------|-----------|-------------------|
| **Our Multi-LLM** | $0.012 | $12 | **$1,440** |
| All Claude Opus | $0.035 | $35 | $4,200 ❌ |
| All Claude Sonnet | $0.018 | $18 | $2,160 ❌ |
| All GPT-4o-mini | $0.003 | $3 | $360 ⚠️ Lower accuracy |

**Annual Savings:** $2,760 vs all-Opus approach (66% reduction)

[📚 Full cost analysis](./AI_ARCHITECTURE.md#cost-optimization)

---

## 🎨 Screenshots

### Payroll Dashboard - AI Validation
![AI Validation Pipeline](./docs/screenshots/ai-pipeline.png)

### Technology Selection Matrix
![Tech Matrix](./docs/screenshots/tech-matrix.png)

### Agent Execution Timeline
![Timeline](./docs/screenshots/timeline.png)

---

## 🤝 Contributing

We welcome contributions! This project demonstrates cutting-edge AI architecture.

### Areas for Contribution
- **Additional LLM providers** (Gemini, Grok, Mistral)
- **New specialized agents** (currency converter, fatigue analyzer)
- **Performance optimizations** (caching, streaming responses)
- **Testing** (unit tests, integration tests, E2E)
- **Documentation** (tutorials, architecture diagrams)

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/aioscrew.git

# Create feature branch
git checkout -b feature/your-feature

# Make changes, test, commit
npm test
git commit -m "Add amazing feature"

# Push and create PR
git push origin feature/your-feature
```

---

## 📊 Project Status

### ✅ Completed
- Multi-LLM architecture with 3 providers
- Hierarchical agent orchestration
- Parallel agent execution
- Visual pipeline and timeline UX
- Technology selection matrix
- Cost optimization strategy
- Railway deployment
- Comprehensive documentation

### 🚧 In Progress
- Real-time WebSocket updates
- Agent performance metrics API
- Batch claim validation
- A/B testing framework for LLM selection

### 📋 Roadmap
- Vector database for historical precedent
- Learning from feedback (reinforcement learning)
- Dynamic agent selection based on claim type
- Human-in-the-loop for low-confidence decisions
- Multi-language support
- Mobile app

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

---

## 🙏 Acknowledgments

- **Anthropic** - Claude AI models
- **OpenAI** - GPT models
- **Neon** - Serverless PostgreSQL
- **Railway** - Deployment platform
- **Copa Airlines** - Use case and requirements
- **dCortex** - AI expertise and guidance

---

## 📞 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/jbandu/aioscrew/issues)
- **Discussions:** [GitHub Discussions](https://github.com/jbandu/aioscrew/discussions)
- **Email:** support@aioscrew.com (future)
- **Twitter:** [@aioscrew](https://twitter.com/aioscrew) (future)

---

## ⭐ Star History

If you find this project valuable, please star it on GitHub! It helps others discover this sophisticated AI architecture.

[![Star History Chart](https://api.star-history.com/svg?repos=jbandu/aioscrew&type=Date)](https://star-history.com/#jbandu/aioscrew&Date)

---

**Built with ❤️ for Copa Airlines | Powered by AI from dCortex**

**This project demonstrates enterprise-grade multi-agent AI systems with intelligent cost optimization and transparent decision-making.**
