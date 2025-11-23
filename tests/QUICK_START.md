# Quick Start Guide - E2E Testing

Get up and running with E2E tests in 5 minutes!

## 🚀 Quick Setup (3 steps)

### 1. Install Dependencies

```bash
npm install
npx playwright install chromium
```

### 2. Configure Backend

Create `backend/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
DATABASE_URL=postgresql://your-neon-db-url
PORT=3001
NODE_ENV=development
```

### 3. Run Tests

```bash
# Start servers (2 terminals)
npm run dev                    # Terminal 1: Frontend
cd backend && npm run dev      # Terminal 2: Backend

# Run tests (3rd terminal)
npm test                       # Run all tests
npm run test:ui                # Interactive mode (recommended)
```

## 🎯 Essential Commands

```bash
# Quick smoke test (30 seconds)
npx playwright test smoke.spec.ts

# Test specific functionality
npm run test:payroll    # Payroll admin & AI validation
npm run test:crew       # Crew member dashboard
npm run test:api        # API endpoints only

# Debug failing test
npm run test:debug

# View test report
npm run test:report
```

## 📊 Test Status

After running tests, you'll see:

```
✅ Passed: Tests that succeeded
❌ Failed: Tests that need attention
⏭️  Skipped: Tests not run (if any)
⏱️  Duration: Total execution time
```

## 🔍 Common First-Time Issues

### Issue: "Cannot connect to server"

**Fix:**
```bash
# Ensure servers are running
npm run dev              # Port 5173
cd backend && npm run dev # Port 3001
```

### Issue: "ANTHROPIC_API_KEY not found"

**Fix:** Add to `backend/.env`:
```env
ANTHROPIC_API_KEY=sk-ant-...
```

### Issue: "Database connection failed"

**Fix:** Check `DATABASE_URL` in `backend/.env`

### Issue: Tests timeout

**Normal!** AI validation takes 15-20 seconds. Just wait.

## 📝 What Gets Tested?

1. **Landing Page** - Role selection works
2. **7 Role Dashboards** - All roles load correctly
3. **AI Validation** - 3 agents run in parallel
4. **Claim Management** - Submit, approve, reject claims
5. **API Endpoints** - Backend responds correctly
6. **Real-time Updates** - WebSocket connectivity
7. **Responsive Design** - Mobile/tablet/desktop

## 🎓 Next Steps

1. ✅ Run `npm run test:ui` to see tests in action
2. ✅ Read full docs: `tests/README.md`
3. ✅ Write your first test (see examples below)

## ✍️ Write Your First Test

Create `tests/e2e/my-test.spec.ts`:

```typescript
import { test, expect } from './fixtures/base';

test('my first test', async ({ page, gotoRole }) => {
  // Navigate to crew member dashboard
  await gotoRole('crew-member');

  // Verify it loaded
  await expect(page.locator('h1, h2')).toContainText(/crew|dashboard/i);

  // Take a screenshot
  await page.screenshot({ path: 'my-test.png' });
});
```

Run it:
```bash
npx playwright test my-test.spec.ts --headed
```

## 🆘 Need Help?

- 📖 Full docs: `tests/README.md`
- 🌐 Playwright docs: https://playwright.dev
- 🐛 Report issues: GitHub Issues

## 🎉 You're Ready!

Start testing with:
```bash
npm run test:ui
```

Happy testing! 🚀
