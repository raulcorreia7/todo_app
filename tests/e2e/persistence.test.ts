import { test, expect } from "@playwright/test";
import {
  addTask,
  waitForTask,
  completeTask,
  getTaskCount,
  openSettings,
  selectTheme,
  toggleSound,
  setVolume,
  clearLocalStorage,
  getLocalStorageItem,
} from "./helpers";

test.describe("Task Persistence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearLocalStorage(page);
    await page.reload();
  });

  test("should persist tasks after page reload", async ({ page }) => {
    await addTask(page, "Persistent Task 1", "Description 1");
    await addTask(page, "Persistent Task 2", "Description 2");
    await waitForTask(page, "Persistent Task 2");

    expect(await getTaskCount(page)).toBe(2);

    await page.reload();

    await waitForTask(page, "Persistent Task 1");
    await waitForTask(page, "Persistent Task 2");

    expect(await getTaskCount(page)).toBe(2);
  });

  test("should persist completed task state after reload", async ({ page }) => {
    await addTask(page, "Task to Complete");
    await waitForTask(page, "Task to Complete");

    await completeTask(page, "Task to Complete");

    await page.reload();

    const task = await waitForTask(page, "Task to Complete");
    await expect(task).toHaveClass(/task-item--completed/);
  });

  test("should persist multiple tasks with mixed states", async ({ page }) => {
    await addTask(page, "Active Task");
    await addTask(page, "Completed Task");
    await waitForTask(page, "Completed Task");

    await completeTask(page, "Completed Task");

    await page.reload();

    const activeTask = await waitForTask(page, "Active Task");
    const completedTask = await waitForTask(page, "Completed Task");

    await expect(activeTask).not.toHaveClass(/task-item--completed/);
    await expect(completedTask).toHaveClass(/task-item--completed/);
  });

  test("should store tasks in localStorage", async ({ page }) => {
    await addTask(page, "LocalStorage Task");
    await waitForTask(page, "LocalStorage Task");

    const stored = await getLocalStorageItem(page, "luxury-todos-v2");
    expect(stored).toBeTruthy();

    if (!stored) throw new Error("Expected stored to be truthy");
    const parsed = JSON.parse(stored);
    expect(Array.isArray(parsed)).toBe(true);
    expect(
      parsed.some((t: { title: string }) => t.title === "LocalStorage Task")
    ).toBe(true);
  });

  test("should persist empty task list", async ({ page }) => {
    await page.reload();

    expect(await getTaskCount(page)).toBe(0);
  });
});

test.describe("Settings Persistence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearLocalStorage(page);
    await page.reload();
  });

  test("should persist theme after page reload", async ({ page }) => {
    await openSettings(page);
    await selectTheme(page, "Midnight");

    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      "midnight"
    );

    await page.reload();

    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      "midnight"
    );
  });

  test("should persist sound settings after page reload", async ({ page }) => {
    await openSettings(page);
    await toggleSound(page);

    await page.reload();
    await openSettings(page);

    const soundCheckbox = page.locator(
      '.sound-settings__toggle input[type="checkbox"]'
    );
    await expect(soundCheckbox).not.toBeChecked();
  });

  test("should persist volume setting after page reload", async ({ page }) => {
    await openSettings(page);
    await setVolume(page, 42);

    await page.reload();
    await openSettings(page);

    const volumeLabel = page.locator(".sound-settings__volume-label");
    await expect(volumeLabel).toContainText("42%");
  });

  test("should persist all settings together", async ({ page }) => {
    await openSettings(page);
    await selectTheme(page, "Aurora");
    await setVolume(page, 80);
    await toggleSound(page);

    await page.reload();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "aurora");

    await openSettings(page);

    const volumeLabel = page.locator(".sound-settings__volume-label");
    await expect(volumeLabel).toContainText("80%");

    const soundCheckbox = page.locator(
      '.sound-settings__toggle input[type="checkbox"]'
    );
    await expect(soundCheckbox).not.toBeChecked();
  });

  test("should store settings in localStorage", async ({ page }) => {
    await openSettings(page);
    await selectTheme(page, "Sakura");

    const stored = await getLocalStorageItem(page, "luxury-todo-settings-v2");
    expect(stored).toBeTruthy();

    if (!stored) throw new Error("Expected stored to be truthy");
    const parsed = JSON.parse(stored);
    expect(parsed.theme).toBe("sakura");
  });
});

test.describe("Gamification Persistence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearLocalStorage(page);
    await page.reload();
  });

  test("should persist karma points after page reload", async ({ page }) => {
    await addTask(page, "Karma Task");
    await waitForTask(page, "Karma Task");

    await page.waitForTimeout(500);

    const karmaBefore = await page
      .locator(".stat-card.stat-karma .stat-value")
      .textContent();

    await page.reload();

    const karmaAfter = await page
      .locator(".stat-card.stat-karma .stat-value")
      .textContent();
    expect(karmaAfter).toBe(karmaBefore);
  });
});
