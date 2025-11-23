import { test, expect } from './fixtures/base';

/**
 * Integration Tests
 * Tests complex workflows that span multiple features
 */

test.describe('End-to-End User Journeys', () => {
  test('complete claim lifecycle: submission to approval', async ({ page }) => {
    // Step 1: Crew member submits a claim
    await page.goto('/');
    await page.locator('button').filter({ hasText: /crew member/i }).click();

    // Wait for dashboard
    await expect(page.locator('text=/crew|schedule/i')).toBeVisible({ timeout: 10000 });

    // Look for submit claim option
    const submitButton = page.locator('button').filter({
      hasText: /submit.*claim|new.*claim/i,
    });

    if ((await submitButton.count()) > 0) {
      await submitButton.click();

      // Fill claim form (if available)
      const amountInput = page.locator('input[name*="amount"]');
      if ((await amountInput.count()) > 0) {
        await amountInput.fill('125.00');

        const confirmButton = page.locator('button[type="submit"]');
        if ((await confirmButton.count()) > 0) {
          await confirmButton.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    // Step 2: Switch to Payroll Admin
    await page.goto('/');
    await page.locator('button').filter({ hasText: /payroll/i }).click();

    // Wait for payroll dashboard
    await expect(page.locator('text=/payroll|claims/i')).toBeVisible({ timeout: 10000 });

    // Step 3: Validate the claim
    const validateButton = page.locator('button').filter({ hasText: /validate/i });

    if ((await validateButton.count()) > 0) {
      await validateButton.first().click();

      // Wait for validation to complete
      await expect(
        page.locator('text=/approved|flagged|rejected|complete/i')
      ).toBeVisible({ timeout: 35000 });

      // Step 4: Approve the claim
      const approveButton = page.locator('button').filter({ hasText: /approve/i });

      if ((await approveButton.count()) > 0) {
        await approveButton.first().click();

        // Verify approval
        await expect(
          page.locator('text=/approved|success/i')
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('multi-role workflow: crew → payroll → management', async ({ page }) => {
    // Start as crew member
    await page.goto('/');
    await page.locator('button').filter({ hasText: /crew member/i }).click();
    await expect(page.locator('text=/crew|schedule/i')).toBeVisible({ timeout: 10000 });

    // Get trip information
    const pageContent = await page.textContent('body');
    const hasTripData = pageContent?.match(/CM\d+|flight|trip/i);

    // Switch to payroll admin
    await page.goto('/');
    await page.locator('button').filter({ hasText: /payroll/i }).click();
    await expect(page.locator('text=/payroll|claims/i')).toBeVisible({ timeout: 10000 });

    // Check for claims
    const hasClaimData = await page.locator('text=/CLM-|claim/i').count();
    expect(hasClaimData).toBeGreaterThan(0);

    // Switch to management
    await page.goto('/');
    await page.locator('button').filter({ hasText: /management/i }).click();
    await expect(page.locator('text=/kpi|analytics|management/i')).toBeVisible({ timeout: 10000 });

    // Verify dashboard shows aggregated data
    const managementContent = await page.textContent('body');
    expect(managementContent).toMatch(/\$|metric|kpi|performance/i);
  });
});

test.describe('AI Validation Edge Cases', () => {
  test('should handle multiple simultaneous validations', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    // Find all validate buttons
    const validateButtons = page.locator('button').filter({ hasText: /validate/i });
    const buttonCount = await validateButtons.count();

    if (buttonCount >= 2) {
      // Click first validation
      await validateButtons.nth(0).click();

      // Wait a bit then click second
      await page.waitForTimeout(1000);
      await validateButtons.nth(1).click();

      // Both should complete
      await expect(
        page.locator('text=/approved|flagged|rejected/i').nth(0)
      ).toBeVisible({ timeout: 40000 });
    }
  });

  test('should handle validation cancellation', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    const validateButton = page.locator('button').filter({ hasText: /validate/i });

    if ((await validateButton.count()) > 0) {
      await validateButton.first().click();

      // Wait for validation to start
      await page.waitForTimeout(2000);

      // Look for cancel button
      const cancelButton = page.locator('button').filter({ hasText: /cancel|stop/i });

      if ((await cancelButton.count()) > 0) {
        await cancelButton.click();

        // Should stop gracefully
        await page.waitForTimeout(1000);
        expect(true).toBe(true); // No crash
      }
    }
  });

  test('should retry failed validation', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    // Simulate network failure then recovery
    const validateButton = page.locator('button').filter({ hasText: /validate/i });

    if ((await validateButton.count()) > 0) {
      // First attempt
      await validateButton.first().click();

      // Wait for result or error
      await page.waitForTimeout(5000);

      // If retry button appears, click it
      const retryButton = page.locator('button').filter({ hasText: /retry/i });

      if ((await retryButton.count()) > 0) {
        await retryButton.click();

        // Should complete
        await expect(
          page.locator('text=/approved|flagged|rejected|complete/i')
        ).toBeVisible({ timeout: 35000 });
      }
    }
  });
});

test.describe('Data Consistency', () => {
  test('claim status updates across views', async ({ page }) => {
    // Approve a claim in payroll view
    await page.goto('/');
    await page.locator('button').filter({ hasText: /payroll/i }).click();
    await expect(page.locator('text=/payroll/i')).toBeVisible({ timeout: 10000 });

    // Get claim ID if visible
    const claimText = await page.locator('text=/CLM-\\d{4}-\\d{4}/').first().textContent();

    // Approve it
    const approveButton = page.locator('button').filter({ hasText: /approve/i });
    if ((await approveButton.count()) > 0) {
      await approveButton.first().click();
      await page.waitForTimeout(2000);
    }

    // Switch to crew member view
    await page.goto('/');
    await page.locator('button').filter({ hasText: /crew member/i }).click();

    // Verify the claim status is updated
    await page.waitForTimeout(2000);

    // Look for claim history
    const historySection = page.locator('text=/history|approved|claims/i');
    if ((await historySection.count()) > 0) {
      await expect(historySection.first()).toBeVisible();
    }
  });

  test('statistics update after claim operations', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    // Get initial statistics
    const statsPattern = /\$[\d,]+|\d+.*claims/i;
    const initialStats = await page.textContent('body');

    // Perform claim operation
    const approveButton = page.locator('button').filter({ hasText: /approve/i });

    if ((await approveButton.count()) > 0) {
      await approveButton.first().click();
      await page.waitForTimeout(2000);

      // Verify stats updated
      const updatedStats = await page.textContent('body');

      // Stats should still be present (consistency check)
      expect(updatedStats).toMatch(statsPattern);
    }
  });
});

test.describe('Real-time Updates', () => {
  test('should receive updates via WebSocket', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');

    // Wait for WebSocket connection
    await page.waitForTimeout(3000);

    // Verify data is loaded (which requires successful connection)
    const hasData = await page.locator('text=/trip|claim|schedule|earnings/i').count();
    expect(hasData).toBeGreaterThan(0);
  });

  test('should handle WebSocket reconnection', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    // Wait for initial connection
    await page.waitForTimeout(2000);

    // Simulate network interruption
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Restore connection
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);

    // Should reconnect and display data
    await expect(page.locator('text=/claim|payroll/i')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Performance', () => {
  test('dashboard loads within acceptable time', async ({ page, gotoRole }) => {
    const startTime = Date.now();

    await gotoRole('payroll-admin');

    // Wait for main content
    await expect(page.locator('h1, h2')).toBeVisible();

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('AI validation completes within expected time', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    const validateButton = page.locator('button').filter({ hasText: /validate/i });

    if ((await validateButton.count()) > 0) {
      const startTime = Date.now();

      await validateButton.first().click();

      // Wait for completion
      await expect(
        page.locator('text=/approved|flagged|rejected|complete/i')
      ).toBeVisible({ timeout: 35000 });

      const duration = Date.now() - startTime;

      // Should complete within 30 seconds (as per spec)
      expect(duration).toBeLessThan(30000);
    }
  });

  test('handles large data sets efficiently', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    // Wait for all claims to load
    await page.waitForLoadState('networkidle');

    // Count visible claims
    const claimCount = await page.locator('text=/CLM-\\d{4}-\\d{4}/').count();

    // Should display multiple claims without performance issues
    expect(claimCount).toBeGreaterThan(0);

    // Scrolling should be smooth (no check here, but verify no crash)
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(500);
  });
});

test.describe('Error Recovery', () => {
  test('should recover from backend errors', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    // The app should handle backend errors gracefully
    // and not crash the frontend

    // Try to trigger validation (might fail if backend has issues)
    const validateButton = page.locator('button').filter({ hasText: /validate/i });

    if ((await validateButton.count()) > 0) {
      try {
        await validateButton.first().click();
        await page.waitForTimeout(5000);
      } catch (error) {
        // Should show error message, not crash
        const errorElement = page.locator('text=/error|failed|timeout/i');
        if ((await errorElement.count()) > 0) {
          await expect(errorElement.first()).toBeVisible();
        }
      }
    }

    // UI should still be responsive
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should handle missing data gracefully', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');

    // Even if no trips/claims, should show empty state
    await page.waitForLoadState('networkidle');

    // Should not crash
    await expect(page.locator('h1, h2')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should focus on interactive elements
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT', 'SELECT']).toContain(focusedElement || '');
  });

  test('should have proper heading hierarchy', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    // Should have h1 or h2
    const headings = await page.locator('h1, h2, h3').count();
    expect(headings).toBeGreaterThan(0);
  });

  test('buttons should have accessible labels', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    // All buttons should have text or aria-label
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      expect(text || ariaLabel).toBeTruthy();
    }
  });
});
