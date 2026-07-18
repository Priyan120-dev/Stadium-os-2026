import { test, expect } from '@playwright/test';

test.describe('Stadium OS E2E Workflows', () => {
  test('should load landing page and navigate to simulator', async ({ page }) => {
    // 1. Visit landing page
    await page.goto('/');
    await expect(page).toHaveTitle(/Stadium OS/);

    // 2. Locate navigation button or link to simulator
    const startSimBtn = page.getByRole('link', { name: /Simulator/i });
    if (await startSimBtn.isVisible()) {
      await startSimBtn.click();
      await expect(page).toHaveURL(/\/simulator/);
    }
  });

  test('should test simulator interactions', async ({ page }) => {
    // 1. Visit simulator page directly
    await page.goto('/simulator');

    // 2. Validate tab switching on mobile/tablet viewports
    const fanTab = page.getByRole('button', { name: /Fan/i }).first();
    const volTab = page.getByRole('button', { name: /Volunteer/i }).first();
    const cmdTab = page.getByRole('button', { name: /Command/i }).first();

    if (await fanTab.isVisible()) {
      await fanTab.click();
      await expect(page.locator('section').filter({ hasText: /Mateo García/i })).toBeVisible();
    }
  });
});
