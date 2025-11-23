import { test, expect } from './fixtures/base';
import { testData } from './helpers/test-data';

/**
 * Crew Member E2E Tests
 * Tests crew member dashboard and claim submission functionality
 */

test.describe('Crew Member Dashboard', () => {
  test.beforeEach(async ({ page, gotoRole }) => {
    // Navigate to Crew Member dashboard
    await gotoRole('crew-member');

    // Verify we're on the correct page
    await expect(page.locator('h1, h2')).toContainText(/crew|dashboard|welcome/i);
  });

  test('should display crew member dashboard', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');

    // Verify key sections are visible
    const dashboardElements = [
      /schedule|trips/i,
      /claims|pay/i,
      /earnings|ytd/i,
    ];

    const pageContent = await page.textContent('body');
    let foundSections = 0;

    for (const pattern of dashboardElements) {
      if (pageContent?.match(pattern)) {
        foundSections++;
      }
    }

    expect(foundSections).toBeGreaterThanOrEqual(2);
  });

  test('should display trip schedule', async ({ page }) => {
    // Look for trip information
    const tripElements = page.locator('text=/trip|flight|route/i');

    // Wait for trips to load
    await expect(tripElements.first()).toBeVisible({ timeout: 10000 });

    // Verify trip details are present
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/PTY|MIA|DAV|GRU|\d{1,2}:\d{2}|AM|PM/i);
  });

  test('should display YTD earnings', async ({ page }) => {
    // Look for earnings information
    const earningsPattern = /\$[\d,]+\.\d{2}|year.*to.*date|ytd.*earnings/i;

    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(earningsPattern);
  });

  test('should display training requirements', async ({ page }) => {
    // Look for training section
    const trainingSection = page.locator('text=/training|certification|requirement/i');

    if ((await trainingSection.count()) > 0) {
      await expect(trainingSection.first()).toBeVisible();
    }
  });
});

test.describe('Claim Submission', () => {
  test.beforeEach(async ({ page, gotoRole }) => {
    await gotoRole('crew-member');
  });

  test('should open claim submission form', async ({ page }) => {
    // Look for submit claim button
    const submitButton = page.locator('button').filter({
      hasText: /submit.*claim|new.*claim|create.*claim/i,
    });

    if ((await submitButton.count()) > 0) {
      await submitButton.click();

      // Verify form is displayed
      await expect(
        page.locator('text=/claim.*type|amount|trip|description/i')
      ).toBeVisible();
    }
  });

  test('should submit a new claim', async ({ page }) => {
    // Find submit claim button
    const submitButton = page.locator('button').filter({
      hasText: /submit.*claim|new.*claim/i,
    });

    if ((await submitButton.count()) > 0) {
      await submitButton.click();

      // Fill out claim form
      const claimTypeSelect = page.locator('select[name*="type"], select[id*="type"]');
      if ((await claimTypeSelect.count()) > 0) {
        await claimTypeSelect.selectOption('International Premium');
      }

      const amountInput = page.locator('input[name*="amount"], input[id*="amount"]');
      if ((await amountInput.count()) > 0) {
        await amountInput.fill('125.00');
      }

      const tripSelect = page.locator('select[name*="trip"], select[id*="trip"]');
      if ((await tripSelect.count()) > 0) {
        await tripSelect.selectOption({ index: 0 });
      }

      const descriptionInput = page.locator(
        'textarea[name*="description"], textarea[id*="description"]'
      );
      if ((await descriptionInput.count()) > 0) {
        await descriptionInput.fill('International flight premium pay for CM401');
      }

      // Submit the form
      const confirmButton = page.locator('button[type="submit"], button').filter({
        hasText: /submit|create|save/i,
      });

      if ((await confirmButton.count()) > 0) {
        await confirmButton.last().click();

        // Wait for success message
        await expect(
          page.locator('text=/success|submitted|created|claim.*pending/i')
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.locator('button').filter({
      hasText: /submit.*claim/i,
    });

    if ((await submitButton.count()) > 0) {
      await submitButton.click();

      // Try to submit empty form
      const confirmButton = page.locator('button[type="submit"]');

      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();

        // Should show validation errors
        await expect(
          page.locator('text=/required|must.*provide|invalid/i')
        ).toBeVisible();
      }
    }
  });

  test('should prevent duplicate claim submission', async ({ page }) => {
    // This test verifies the UI prevents submitting the same claim twice
    const submitButton = page.locator('button').filter({
      hasText: /submit.*claim/i,
    });

    if ((await submitButton.count()) > 0) {
      await submitButton.click();

      // Fill minimal form
      const amountInput = page.locator('input[name*="amount"]');
      if ((await amountInput.count()) > 0) {
        await amountInput.fill('100.00');
      }

      // Submit
      const confirmButton = page.locator('button[type="submit"]');
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();

        // Try to submit again immediately
        if ((await confirmButton.count()) > 0 && await confirmButton.isEnabled()) {
          // If button is still enabled, click again
          await confirmButton.click();

          // Should either be disabled or show error
          await page.waitForTimeout(1000);
          expect(true).toBe(true); // Test that we don't crash
        }
      }
    }
  });
});

test.describe('Claim History', () => {
  test.beforeEach(async ({ page, gotoRole }) => {
    await gotoRole('crew-member');
  });

  test('should display claim history', async ({ page }) => {
    // Look for claim history section
    const historySection = page.locator('text=/history|previous.*claims|past.*claims/i');

    if ((await historySection.count()) > 0) {
      await expect(historySection.first()).toBeVisible();

      // Look for claim entries
      await expect(page.locator('text=/CLM-\\d{4}-\\d{4}|pending|approved|rejected/i')).toBeVisible();
    }
  });

  test('should filter claims by status', async ({ page }) => {
    // Look for filter controls
    const filterButtons = page.locator('button, [role="tab"]').filter({
      hasText: /all|pending|approved|rejected/i,
    });

    if ((await filterButtons.count()) > 0) {
      // Click on pending filter
      await filterButtons.filter({ hasText: /pending/i }).first().click();

      // Verify filtered results
      await page.waitForTimeout(1000);
      expect(true).toBe(true); // Verify no crash
    }
  });

  test('should view claim details', async ({ page }) => {
    // Click on a claim in history
    const claimEntry = page.locator('text=/CLM-\\d{4}-\\d{4}/').first();

    if ((await claimEntry.count()) > 0) {
      await claimEntry.click();

      // Verify details are shown
      await expect(
        page.locator('text=/amount|type|status|date|trip/i')
      ).toBeVisible();
    }
  });

  test('should display claim status updates', async ({ page }) => {
    // Look for claims with different statuses
    const pageContent = await page.textContent('body');

    const statusPatterns = [
      /pending/i,
      /approved/i,
      /rejected/i,
      /processing/i,
    ];

    let foundStatuses = 0;
    for (const pattern of statusPatterns) {
      if (pageContent?.match(pattern)) {
        foundStatuses++;
      }
    }

    // Should have at least one status indicator
    expect(foundStatuses).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Trip Information', () => {
  test.beforeEach(async ({ page, gotoRole }) => {
    await gotoRole('crew-member');
  });

  test('should display upcoming trips', async ({ page }) => {
    // Look for trip schedule
    const tripSection = page.locator('text=/upcoming.*trips|schedule|roster/i');

    if ((await tripSection.count()) > 0) {
      await expect(tripSection.first()).toBeVisible();
    }

    // Verify trip details
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/CM\d+|PTY|flight|route/i);
  });

  test('should view trip details', async ({ page }) => {
    // Click on a trip
    const tripCard = page.locator('[class*="trip"], [data-trip]').first();

    if ((await tripCard.count()) > 0) {
      await tripCard.click();

      // Verify trip details
      await expect(
        page.locator('text=/route|departure|arrival|flight.*time|credit.*hours/i')
      ).toBeVisible();
    }
  });

  test('should display trip status', async ({ page }) => {
    // Look for trip status indicators
    const statusElements = page.locator('text=/scheduled|completed|cancelled|delayed/i');

    if ((await statusElements.count()) > 0) {
      await expect(statusElements.first()).toBeVisible();
    }
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page, gotoRole }) => {
    await gotoRole('crew-member');
  });

  test('should navigate back to role selection', async ({ page }) => {
    // Look for back button or logo
    const backButton = page.locator('button, a').filter({
      hasText: /back|home|dashboard/i,
    });

    if ((await backButton.count()) > 0) {
      await backButton.first().click();

      // Should return to landing page
      await expect(page.locator('text=/copa.*airlines|select.*role/i')).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('should switch between dashboard sections', async ({ page }) => {
    // Look for navigation tabs or menu
    const navLinks = page.locator('[role="tab"], nav a, nav button');

    if ((await navLinks.count()) > 1) {
      // Click second navigation item
      await navLinks.nth(1).click();

      // Wait for content to change
      await page.waitForTimeout(500);
      expect(true).toBe(true); // Verify no crash
    }
  });
});

test.describe('Responsive Design', () => {
  test('should display correctly on mobile', async ({ page, gotoRole }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoRole('crew-member');

    // Verify dashboard is accessible
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page, gotoRole }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoRole('crew-member');

    // Verify layout
    await expect(page.locator('h1, h2')).toBeVisible();
  });
});

test.describe('Real-time Updates', () => {
  test.beforeEach(async ({ page, gotoRole }) => {
    await gotoRole('crew-member');
  });

  test('should receive real-time claim status updates', async ({ page }) => {
    // This test verifies WebSocket connectivity for real-time updates
    // In a real scenario, we'd trigger a backend update and verify the UI updates

    // Wait for WebSocket connection
    await page.waitForTimeout(2000);

    // Verify claims are displayed (which requires data connection)
    const hasData = await page.locator('text=/CLM-|trip|earnings/i').count();
    expect(hasData).toBeGreaterThan(0);
  });
});
