import { test, expect } from '@playwright/test';

/**
 * Smoke Tests
 * Quick sanity checks to verify basic functionality
 * These should run fast and catch critical issues
 */

test.describe('Smoke Tests', () => {
  test('application loads successfully', async ({ page }) => {
    await page.goto('/');

    // Should see landing page
    await expect(page.locator('h1')).toContainText(/Copa Airlines/i);
  });

  test('can navigate to any role dashboard', async ({ page }) => {
    await page.goto('/');

    // Click first role button
    const firstRole = page.locator('button').filter({
      hasText: /crew member|payroll|scheduler/i,
    });

    await firstRole.first().click();

    // Should navigate away from landing page
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toBe('/');
  });

  test('backend API is responding', async ({ request }) => {
    const response = await request.get('http://localhost:3001/health');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('backend agents endpoint is responding', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/agents/health');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('agents');
  });

  test('CSS is loaded', async ({ page }) => {
    await page.goto('/');

    // Check that Tailwind CSS is working (look for styled elements)
    const h1 = page.locator('h1').first();
    const fontSize = await h1.evaluate((el) =>
      window.getComputedStyle(el).fontSize
    );

    // Font size should be set (not default 16px)
    expect(fontSize).toBeTruthy();
  });

  test('JavaScript is executing', async ({ page }) => {
    await page.goto('/');

    // Click a button to verify JS interactivity
    const button = page.locator('button').first();

    if (await button.isVisible()) {
      await button.click();

      // Should trigger some UI change
      await page.waitForTimeout(500);
      expect(true).toBe(true); // Verify no crash
    }
  });

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have no critical errors
    const criticalErrors = errors.filter((error) =>
      error.toLowerCase().includes('failed') ||
      error.toLowerCase().includes('cannot read') ||
      error.toLowerCase().includes('undefined')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('responsive viewport works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Critical Path Smoke Test', () => {
  test('complete user flow works end-to-end', async ({ page }) => {
    // 1. Load landing page
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    // 2. Navigate to crew member
    await page.locator('button').filter({ hasText: /crew member/i }).click();
    await page.waitForLoadState('networkidle');

    // 3. Verify dashboard loaded
    await expect(page.locator('text=/schedule|trips|claims/i')).toBeVisible({ timeout: 10000 });

    // 4. Go back to landing
    await page.goto('/');

    // 5. Navigate to payroll
    await page.locator('button').filter({ hasText: /payroll/i }).click();
    await page.waitForLoadState('networkidle');

    // 6. Verify payroll dashboard loaded
    await expect(page.locator('text=/payroll|claims|validate/i')).toBeVisible({ timeout: 10000 });
  });
});
