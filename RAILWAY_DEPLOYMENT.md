# Railway Deployment Guide - Full Stack Setup

## Overview

You need **2 Railway services**:
1. **Frontend** - React + Vite (existing)
2. **Backend** - Express + AI Agents (new)

---

## Service 1: Backend API

### A. Create Backend Service on Railway

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `aioscrew` repository
4. Railway will detect the monorepo

### B. Configure Backend Service

**Root Directory:** Set to `backend` (important!)

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
```env
ANTHROPIC_API_KEY=sk-ant-xxx
DATABASE_URL=${{ Neon.DATABASE_URL }}
PORT=3001
NODE_ENV=production
FRONTEND_URL=${{ Frontend.url }}
```

### C. Backend Railway Configuration

I'll create the config files:

---

## Service 2: Frontend

### A. Configure Frontend Service

**Root Directory:** `/` (repository root)

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run preview
```

**Environment Variables:**
```env
VITE_DATABASE_URL=${{ Neon.DATABASE_URL }}
VITE_API_URL=${{ Backend.url }}
```

---

## Deployment Steps

### Step 1: Deploy Backend First

1. Create new Railway service
2. Link to GitHub repo
3. Set root directory: `backend`
4. Add environment variables
5. Deploy
6. Copy the Railway URL (e.g., `https://aioscrew-backend.up.railway.app`)

### Step 2: Deploy Frontend

1. Create another Railway service (same project)
2. Link to GitHub repo
3. Set root directory: `/` (root)
4. Add environment variables (use backend URL from step 1)
5. Deploy

### Step 3: Update Environment Variables

Go back to **Backend service** settings:
- Set `FRONTEND_URL` to your frontend Railway URL
- This enables CORS

---

## Configuration Files

I'll create the Railway-specific config files now...
