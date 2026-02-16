import type { Page, Locator } from '@playwright/test';

export async function addTask(page: Page, title: string, description?: string): Promise<void> {
  const titleInput = page.locator('.add-task-form input[type="text"]');
  await titleInput.waitFor({ state: 'visible' });
  await titleInput.fill(title);
  
  if (description) {
    const descriptionInput = page.locator('.add-task-form textarea');
    await descriptionInput.fill(description);
  }
  
  await page.locator('.add-task-form button[type="submit"]').click({ force: true });
  await page.waitForTimeout(100);
}

export async function waitForTask(page: Page, title: string): Promise<Locator> {
  const task = page.locator('.task-item', { hasText: title });
  await task.waitFor({ state: 'visible' });
  return task;
}

export async function getTaskCount(page: Page): Promise<number> {
  return await page.locator('.task-item').count();
}

export async function getTaskByTitle(page: Page, title: string): Promise<Locator> {
  return page.locator('.task-item', { hasText: title });
}

export async function editTask(page: Page, taskTitle: string, newTitle: string, newDescription?: string): Promise<void> {
  const task = await getTaskByTitle(page, taskTitle);
  await task.locator('.task-edit-btn').click({ force: true });
  
  const editInput = page.locator('.task-item--editing input[type="text"]');
  await editInput.fill(newTitle);
  
  if (newDescription !== undefined) {
    const editTextarea = page.locator('.task-item--editing textarea');
    await editTextarea.fill(newDescription);
  }
  
  await page.locator('.task-item--editing .task-edit-save-btn').click({ force: true });
}

export async function completeTask(page: Page, taskTitle: string): Promise<void> {
  const task = await getTaskByTitle(page, taskTitle);
  await task.locator('input[type="checkbox"]').click({ force: true });
}

export async function deleteTask(page: Page, taskTitle: string): Promise<void> {
  const task = await getTaskByTitle(page, taskTitle);
  await task.locator('.task-delete-btn').click({ force: true });
  await page.locator('.modal.active').waitFor({ state: 'visible' });
  await page.locator('.modal.active .btn--danger-hybrid, .modal.active .btn--primary').click({ force: true });
  await page.waitForTimeout(200);
}

export async function setFilter(page: Page, filter: 'all' | 'active' | 'completed'): Promise<void> {
  await page.locator('.filter-group button', { hasText: filter.charAt(0).toUpperCase() + filter.slice(1) }).click({ force: true });
}

export async function clearCompletedTasks(page: Page): Promise<void> {
  await page.locator('.center-action-bar button[data-action="clear"]').click({ force: true });
  await page.locator('.modal.active').waitFor({ state: 'visible' });
  await page.locator('.modal.active .btn--danger-hybrid, .modal.active .btn--primary').click({ force: true });
  await page.waitForTimeout(300);
}

export async function deleteAllTasks(page: Page): Promise<void> {
  await page.locator('.center-action-bar button[data-action="delete"]').click({ force: true });
  await page.locator('.modal.active').waitFor({ state: 'visible' });
  await page.locator('.modal.active .btn--danger-hybrid, .modal.active .btn--primary').click({ force: true });
  await page.waitForTimeout(300);
}

export async function openActionBar(page: Page): Promise<void> {
  const actionBar = page.locator('.center-action-bar');
  await actionBar.waitFor({ state: 'visible' });
}

export async function openSettings(page: Page): Promise<void> {
  await page.locator('.center-action-bar button[data-action="settings"]').click({ force: true });
  await page.locator('.settings-panel--open').waitFor({ state: 'visible' });
}

export async function closeSettings(page: Page): Promise<void> {
  await page.locator('.settings-panel__close').click();
}

export async function selectTheme(page: Page, themeName: string): Promise<void> {
  await page.locator('.theme-option', { hasText: themeName }).click();
}

export async function toggleSound(page: Page): Promise<void> {
  await page.locator('.sound-settings__toggle input[type="checkbox"]').click();
}

export async function setVolume(page: Page, volume: number): Promise<void> {
  const slider = page.locator('.sound-settings__slider');
  await slider.fill(volume.toString());
}

export async function getKarmaPoints(page: Page): Promise<number> {
  const karmaText = await page.locator('.stat-card.stat-karma .stat-value').textContent();
  return parseInt(karmaText || '0', 10);
}

export async function openAchievements(page: Page): Promise<void> {
  await page.locator('.stat-card.stat-karma').click({ force: true });
  await page.locator('.achievements-list').waitFor({ state: 'visible' });
}

export async function closeAchievements(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
}

export async function getUnlockedAchievements(page: Page): Promise<Locator[]> {
  return page.locator('.achievement-card--unlocked').all();
}

export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

export async function getLocalStorageItem(page: Page, key: string): Promise<string | null> {
  return page.evaluate((k) => localStorage.getItem(k), key);
}

export async function waitForKarmaChange(page: Page, initialValue: number): Promise<number> {
  await page.waitForFunction(
    (expected) => {
      const el = document.querySelector('.stat-card.stat-karma .stat-value');
      const currentValue = el ? parseInt(el.textContent || '0', 10) : 0;
      return currentValue !== expected;
    },
    initialValue,
    { timeout: 5000 }
  );
  return getKarmaPoints(page);
}
