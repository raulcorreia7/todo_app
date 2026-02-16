import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('homepage matches', async ({ page }) => {
    await expect(page).toHaveScreenshot('homepage.png', {
      maxDiffPixels: 2500,
    });
  });

  test('theme emerald', async ({ page }) => {
    await expect(page).toHaveScreenshot('theme-emerald.png', {
      maxDiffPixels: 2500,
    });
  });

  test('task list with items', async ({ page }) => {
    await page.fill('.task-form__title-input', 'Test task for screenshot');
    await page.click('.task-form__add-btn', { force: true });
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('task-list-with-items.png', {
      maxDiffPixels: 2500,
    });
  });
});
