import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Custom fixtures for Aioscrew E2E tests
 */

export type Role =
  | 'crew-member'
  | 'payroll-admin'
  | 'scheduler'
  | 'controller'
  | 'management'
  | 'union'
  | 'executive';

export interface AioscrewFixtures {
  /**
   * Authenticates and navigates to a specific role dashboard
   */
  authenticatedPage: Page;

  /**
   * Navigates to a specific role view
   */
  gotoRole: (role: Role) => Promise<void>;

  /**
   * Wait for AI validation to complete
   */
  waitForAIValidation: () => Promise<void>;
}

export const test = base.extend<AioscrewFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for landing page to load
    await expect(page.locator('h1')).toContainText('Copa Airlines');

    await use(page);
  },

  gotoRole: async ({ page }, use) => {
    const navigate = async (role: Role) => {
      await page.goto('/');

      // Click on role card
      const roleMap: Record<Role, string> = {
        'crew-member': 'Crew Member',
        'payroll-admin': 'Payroll Admin',
        'scheduler': 'Crew Scheduler',
        'controller': 'Operations Controller',
        'management': 'Management',
        'union': 'Union Representative',
        'executive': 'Executive Dashboard',
      };

      await page.getByRole('button', { name: roleMap[role] }).click();

      // Wait for navigation
      await page.waitForURL(/.*\/(crew-member|payroll|scheduler|controller|management|union|executive).*/);
    };

    await use(navigate);
  },

  waitForAIValidation: async ({ page }, use) => {
    const waitForValidation = async () => {
      // Wait for validation to start
      await expect(page.getByText(/Validating Claim/i)).toBeVisible({ timeout: 5000 });

      // Wait for all agents to complete (looking for completion indicators)
      await expect(
        page.locator('[data-testid="validation-complete"]').or(
          page.getByText(/Validation Complete|Approved|Flagged|Rejected/i)
        )
      ).toBeVisible({ timeout: 30000 });
    };

    await use(waitForValidation);
  },
});

export { expect };
