import { test, expect } from '@playwright/test';
import { 
  openSettings, 
  closeSettings, 
  selectTheme, 
  toggleSound, 
  setVolume,
  clearLocalStorage
} from './helpers';

test.describe('Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('should open settings panel', async ({ page }) => {
    await openSettings(page);
    
    await expect(page.locator('.settings-panel--open')).toBeVisible();
    await expect(page.locator('.settings-panel__title')).toHaveText('Settings');
  });

  test('should close settings panel with close button', async ({ page }) => {
    await openSettings(page);
    await closeSettings(page);
    
    await expect(page.locator('.settings-panel--open')).not.toBeVisible();
  });

  test('should close settings panel with Escape key', async ({ page }) => {
    await openSettings(page);
    await page.keyboard.press('Escape');
    
    await expect(page.locator('.settings-panel--open')).not.toBeVisible();
  });

  test('should close settings panel when clicking backdrop', async ({ page }) => {
    await openSettings(page);
    await page.locator('.settings-backdrop').click();
    
    await expect(page.locator('.settings-panel--open')).not.toBeVisible();
  });
});

test.describe('Theme Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('should change theme to midnight', async ({ page }) => {
    await openSettings(page);
    await selectTheme(page, 'Midnight');
    
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'midnight');
  });

  test('should change theme to ivory', async ({ page }) => {
    await openSettings(page);
    await selectTheme(page, 'Ivory');
    
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'ivory');
  });

  test('should change theme to emerald', async ({ page }) => {
    await openSettings(page);
    await selectTheme(page, 'Emerald');
    
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'emerald');
  });

  test('should change theme to aurora', async ({ page }) => {
    await openSettings(page);
    await selectTheme(page, 'Aurora');
    
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'aurora');
  });

  test('should show active state on selected theme', async ({ page }) => {
    await openSettings(page);
    await selectTheme(page, 'Sakura');
    
    const selectedTheme = page.locator('.theme-option--active', { hasText: 'Sakura' });
    await expect(selectedTheme).toBeVisible();
  });
});

test.describe('Sound Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('should toggle sound on and off', async ({ page }) => {
    await openSettings(page);
    
    const soundCheckbox = page.locator('.sound-settings__toggle input[type="checkbox"]');
    await expect(soundCheckbox).toBeChecked();
    
    await toggleSound(page);
    await expect(soundCheckbox).not.toBeChecked();
    
    await toggleSound(page);
    await expect(soundCheckbox).toBeChecked();
  });

  test('should change volume', async ({ page }) => {
    await openSettings(page);
    
    await setVolume(page, 75);
    
    const volumeLabel = page.locator('.sound-settings__volume-label');
    await expect(volumeLabel).toContainText('75%');
  });

  test('should set volume to minimum', async ({ page }) => {
    await openSettings(page);
    
    await setVolume(page, 0);
    
    const volumeLabel = page.locator('.sound-settings__volume-label');
    await expect(volumeLabel).toContainText('0%');
  });

  test('should set volume to maximum', async ({ page }) => {
    await openSettings(page);
    
    await setVolume(page, 100);
    
    const volumeLabel = page.locator('.sound-settings__volume-label');
    await expect(volumeLabel).toContainText('100%');
  });
});

test.describe('Reset to Defaults', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('should reset settings to defaults', async ({ page }) => {
    await openSettings(page);
    await selectTheme(page, 'Midnight');
    await setVolume(page, 25);
    await toggleSound(page);
    
    await page.waitForTimeout(300);
    
    const resetBtn = page.locator('.settings-section__reset-btn');
    await resetBtn.waitFor({ state: 'visible' });
    
    await resetBtn.click({ 
      force: true,
      noWaitAfter: false,
      timeout: 5000
    });
    
    await page.waitForTimeout(500);
    
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'emerald');
    const soundCheckbox = page.locator('.sound-settings__toggle input[type="checkbox"]');
    await expect(soundCheckbox).toBeChecked();
  });
});
