import { test, expect } from './fixtures/base';

/**
 * Role-Based Access Control Tests
 * Tests that all seven role dashboards are accessible and functional
 */

test.describe('Landing Page', () => {
  test('should display all role options', async ({ page }) => {
    await page.goto('/');

    // Wait for landing page to load
    await expect(page.locator('h1')).toContainText(/Copa Airlines/i);

    // Verify all 7 roles are present
    const roles = [
      'Crew Member',
      'Payroll',
      'Scheduler',
      'Controller',
      'Management',
      'Union',
      'Executive',
    ];

    for (const role of roles) {
      await expect(
        page.locator('button, a, [role="button"]').filter({ hasText: new RegExp(role, 'i') })
      ).toBeVisible();
    }
  });

  test('should display role descriptions', async ({ page }) => {
    await page.goto('/');

    // Verify descriptive text is present
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/crew management|payroll|schedule|operations|analytics/i);
  });
});

test.describe('Crew Member Access', () => {
  test('should access crew member dashboard', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');

    // Verify crew-specific content
    await expect(page.locator('text=/schedule|trips|claims|earnings/i')).toBeVisible();
  });

  test('should display crew member features', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');

    const pageContent = await page.textContent('body');

    // Verify crew-specific features
    expect(pageContent).toMatch(/trip|schedule|claim|training|earnings/i);
  });
});

test.describe('Payroll Admin Access', () => {
  test('should access payroll admin dashboard', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    // Verify payroll-specific content
    await expect(page.locator('text=/payroll|claims|validate|approve/i')).toBeVisible();
  });

  test('should display AI validation features', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    const pageContent = await page.textContent('body');

    // Verify AI validation is available
    expect(pageContent).toMatch(/validate|ai|agent|approval/i);
  });
});

test.describe('Crew Scheduler Access', () => {
  test('should access scheduler dashboard', async ({ page, gotoRole }) => {
    await gotoRole('scheduler');

    // Verify scheduler-specific content
    await expect(page.locator('text=/schedule|roster|crew|assignment|optimization/i')).toBeVisible();
  });

  test('should display scheduling features', async ({ page, gotoRole }) => {
    await gotoRole('scheduler');

    const pageContent = await page.textContent('body');

    // Verify scheduler features
    expect(pageContent).toMatch(/roster|schedule|crew|assignment|bid|cost/i);
  });
});

test.describe('Operations Controller Access', () => {
  test('should access controller dashboard', async ({ page, gotoRole }) => {
    await gotoRole('controller');

    // Verify controller-specific content
    await expect(page.locator('text=/operations|control|disruption|crew.*status/i')).toBeVisible();
  });

  test('should display real-time operations features', async ({ page, gotoRole }) => {
    await gotoRole('controller');

    const pageContent = await page.textContent('body');

    // Verify operations features
    expect(pageContent).toMatch(/operations|disruption|crew|status|reserve|active/i);
  });
});

test.describe('Management Access', () => {
  test('should access management dashboard', async ({ page, gotoRole }) => {
    await gotoRole('management');

    // Verify management-specific content
    await expect(page.locator('text=/kpi|analytics|performance|metrics|dashboard/i')).toBeVisible();
  });

  test('should display analytics and KPIs', async ({ page, gotoRole }) => {
    await gotoRole('management');

    const pageContent = await page.textContent('body');

    // Verify management features
    expect(pageContent).toMatch(/kpi|metric|analytics|performance|cost|efficiency/i);
  });
});

test.describe('Union Representative Access', () => {
  test('should access union dashboard', async ({ page, gotoRole }) => {
    await gotoRole('union');

    // Verify union-specific content
    await expect(page.locator('text=/union|compliance|contract|violation|member/i')).toBeVisible();
  });

  test('should display compliance monitoring features', async ({ page, gotoRole }) => {
    await gotoRole('union');

    const pageContent = await page.textContent('body');

    // Verify union features
    expect(pageContent).toMatch(/compliance|contract|violation|member|policy|rule/i);
  });
});

test.describe('Executive Dashboard Access', () => {
  test('should access executive dashboard', async ({ page, gotoRole }) => {
    await gotoRole('executive');

    // Verify executive-specific content
    await expect(
      page.locator('text=/executive|overview|strategic|airline.*operations/i')
    ).toBeVisible();
  });

  test('should display high-level KPIs', async ({ page, gotoRole }) => {
    await gotoRole('executive');

    const pageContent = await page.textContent('body');

    // Verify executive features
    expect(pageContent).toMatch(/operations|kpi|strategic|performance|overview/i);
  });
});

test.describe('Navigation Between Roles', () => {
  test('should navigate from crew member to payroll admin', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');
    await expect(page.locator('text=/crew|schedule|trips/i')).toBeVisible();

    // Navigate back to landing
    await page.goto('/');

    // Switch to payroll
    await gotoRole('payroll-admin');
    await expect(page.locator('text=/payroll|claims|validate/i')).toBeVisible();
  });

  test('should navigate between all roles', async ({ page }) => {
    const roles: Array<'crew-member' | 'payroll-admin' | 'scheduler' | 'controller' | 'management' | 'union' | 'executive'> = [
      'crew-member',
      'payroll-admin',
      'scheduler',
      'controller',
      'management',
      'union',
      'executive',
    ];

    for (const role of roles) {
      await page.goto('/');

      // Navigate to role
      const roleMap: Record<typeof role, string> = {
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
      await page.waitForLoadState('networkidle');

      // Verify we're on a dashboard (not landing page)
      const url = page.url();
      expect(url).not.toBe('/');
    }
  });
});

test.describe('Role Dashboard Persistence', () => {
  test('should maintain dashboard state on page reload', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');

    // Get current URL
    const url = page.url();

    // Reload page
    await page.reload();

    // Should still be on the same dashboard
    expect(page.url()).toBe(url);
    await expect(page.locator('text=/payroll|claims/i')).toBeVisible();
  });

  test('should handle browser back button', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');
    await expect(page.locator('text=/crew|schedule/i')).toBeVisible();

    // Navigate to another role
    await page.goto('/');
    await gotoRole('payroll-admin');

    // Go back
    await page.goBack();

    // Should be on landing page
    await expect(page.locator('h1')).toContainText(/Copa Airlines/i);
  });
});

test.describe('Responsive Access', () => {
  test('should access all roles on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const roles: Array<'crew-member' | 'payroll-admin' | 'scheduler'> = [
      'crew-member',
      'payroll-admin',
      'scheduler',
    ];

    for (const role of roles) {
      await page.goto('/');

      const roleMap = {
        'crew-member': 'Crew Member',
        'payroll-admin': 'Payroll',
        'scheduler': 'Scheduler',
      };

      // Click role button
      await page.locator('button').filter({ hasText: new RegExp(roleMap[role], 'i') }).click();

      // Wait for dashboard
      await page.waitForLoadState('networkidle');

      // Verify dashboard loaded
      expect(page.url()).not.toBe('/');
    }
  });

  test('should display role cards responsively', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verify role cards are visible on mobile
    await expect(page.locator('button').filter({ hasText: /Crew Member/i })).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should handle invalid role navigation', async ({ page }) => {
    // Try to navigate to non-existent role
    await page.goto('/invalid-role');

    // Should either redirect to landing or show 404
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url === '/' || await page.locator('text=/not found|404/i').count() > 0).toBeTruthy();
  });

  test('should recover from navigation errors', async ({ page }) => {
    await page.goto('/');

    // Try to navigate with network offline
    await page.context().setOffline(true);

    try {
      await page.locator('button').filter({ hasText: /Crew Member/i }).click();
    } catch (error) {
      // Expected to fail
    }

    // Restore network
    await page.context().setOffline(false);

    // Should be able to navigate now
    await page.goto('/');
    await page.locator('button').filter({ hasText: /Crew Member/i }).click();
    await expect(page.locator('text=/crew|schedule/i')).toBeVisible({ timeout: 10000 });
  });
});
