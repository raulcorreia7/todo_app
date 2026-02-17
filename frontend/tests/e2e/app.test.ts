import { test, expect } from "@playwright/test";
import {
  clearLocalStorage,
  addTask,
  waitForTask,
  getTaskCount,
  openSettings,
  closeSettings,
  openAchievements,
} from "./helpers";

test.describe("Smoke Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the application", async ({ page }) => {
    await expect(page).toHaveTitle(/Todo/);
    await expect(page.locator(".app-title")).toHaveText("Luxury Todo");
  });

  test("should display main UI components", async ({ page }) => {
    await expect(page.locator(".add-task-form")).toBeVisible();
    await expect(page.locator(".filter-group")).toBeVisible();
    await expect(page.locator(".stat-card.stat-karma")).toBeVisible();
  });

  test("should display task form with input fields", async ({ page }) => {
    const form = page.locator(".add-task-form");
    await expect(form.locator('input[type="text"]')).toBeVisible();
    await expect(form.locator("textarea")).toBeVisible();
    await expect(form.locator('button[type="submit"]')).toBeVisible();
  });

  test("should display filter buttons", async ({ page }) => {
    const filters = page.locator(".filter-group");
    await expect(filters.locator("button", { hasText: "All" })).toBeVisible();
    await expect(
      filters.locator("button", { hasText: "Active" })
    ).toBeVisible();
    await expect(
      filters.locator("button", { hasText: "Completed" })
    ).toBeVisible();
  });

  test("should open and close settings panel", async ({ page }) => {
    await openSettings(page);
    await expect(page.locator(".settings-panel--open")).toBeVisible();

    await closeSettings(page);
    await expect(page.locator(".settings-panel--open")).not.toBeVisible();
  });

  test("should open and close achievements list", async ({ page }) => {
    await openAchievements(page);
    await expect(page.locator(".achievements-list")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator(".achievements-list")).not.toBeVisible();
  });

  test("should display action bar", async ({ page }) => {
    await expect(page.locator(".center-action-bar")).toBeVisible();
  });

  test("should have settings button in action bar", async ({ page }) => {
    await expect(
      page.locator('.center-action-bar button[data-action="settings"]')
    ).toBeVisible();
  });
});

test.describe("Critical User Flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearLocalStorage(page);
    await page.reload();
  });

  test("should complete basic task workflow", async ({ page }) => {
    await addTask(page, "Smoke Test Task", "Testing the basic workflow");
    const task = await waitForTask(page, "Smoke Test Task");
    await expect(task).toBeVisible();

    await task.locator('input[type="checkbox"]').click({ force: true });
    await expect(task).toHaveClass(/task-item--completed/);

    await task.locator(".task-delete-btn").click({ force: true });
    await page
      .locator(".confirm-modal-backdrop, .modal.active")
      .first()
      .waitFor({ state: "visible" });
    await page
      .locator(
        ".confirm-modal__btn--danger, .confirm-modal__btn--confirm, .modal.active .btn--danger-hybrid, .modal.active .btn--primary"
      )
      .first()
      .click({ force: true });
    await page.waitForTimeout(200);
    expect(await getTaskCount(page)).toBe(0);
  });

  test("should handle multiple tasks", async ({ page }) => {
    await addTask(page, "Task A");
    await addTask(page, "Task B");
    await addTask(page, "Task C");

    await waitForTask(page, "Task C");
    expect(await getTaskCount(page)).toBe(3);
  });

  test("should filter tasks correctly", async ({ page }) => {
    await addTask(page, "Active");
    await addTask(page, "Done");
    await waitForTask(page, "Done");

    await page
      .locator(".task-item", { hasText: "Done" })
      .locator('input[type="checkbox"]')
      .click();

    await page.locator(".filter-group button", { hasText: "Active" }).click();
    expect(await getTaskCount(page)).toBe(1);

    await page
      .locator(".filter-group button", { hasText: "Completed" })
      .click();
    expect(await getTaskCount(page)).toBe(1);

    await page.locator(".filter-group button", { hasText: "All" }).click();
    expect(await getTaskCount(page)).toBe(2);
  });
});

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have accessible task form", async ({ page }) => {
    const titleInput = page.locator('.add-task-form input[type="text"]');
    await expect(titleInput).toHaveAttribute("required");
  });

  test("should have aria labels on action buttons", async ({ page }) => {
    const settingsBtn = page.locator(
      '.center-action-bar button[data-action="settings"]'
    );
    await expect(settingsBtn).toHaveAttribute("aria-label");
  });

  test("should have proper heading structure", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });
});
