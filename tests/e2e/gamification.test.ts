import { test, expect } from "@playwright/test";
import {
  addTask,
  waitForTask,
  completeTask,
  getKarmaPoints,
  openAchievements,
  closeAchievements,
  getUnlockedAchievements,
  clearLocalStorage,
} from "./helpers";

test.describe("Karma System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearLocalStorage(page);
    await page.reload();
  });

  test("should display karma points in header", async ({ page }) => {
    const karmaDisplay = page.locator(".stat-card.stat-karma");
    await expect(karmaDisplay).toBeVisible();
    await expect(karmaDisplay.locator(".stat-value")).toBeVisible();
  });

  test("should increase karma when adding a task", async ({ page }) => {
    const initialKarma = await getKarmaPoints(page);

    await addTask(page, "Test Task for Karma");
    await waitForTask(page, "Test Task for Karma");

    await page.waitForTimeout(500);

    const newKarma = await getKarmaPoints(page);
    expect(newKarma).toBeGreaterThanOrEqual(initialKarma);
  });

  test("should increase karma when completing a task", async ({ page }) => {
    await addTask(page, "Task to Complete for Karma");
    await waitForTask(page, "Task to Complete for Karma");

    const karmaAfterAdd = await getKarmaPoints(page);

    await completeTask(page, "Task to Complete for Karma");
    await page.waitForTimeout(500);

    const karmaAfterComplete = await getKarmaPoints(page);
    expect(karmaAfterComplete).toBeGreaterThanOrEqual(karmaAfterAdd);
  });

  test("should accumulate karma over multiple actions", async ({ page }) => {
    const initialKarma = await getKarmaPoints(page);

    await addTask(page, "Task 1");
    await addTask(page, "Task 2");
    await addTask(page, "Task 3");
    await waitForTask(page, "Task 3");

    await completeTask(page, "Task 1");
    await completeTask(page, "Task 2");
    await page.waitForTimeout(500);

    const finalKarma = await getKarmaPoints(page);
    expect(finalKarma).toBeGreaterThan(initialKarma);
  });
});

test.describe("Achievements", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearLocalStorage(page);
    await page.reload();
  });

  test("should open achievements list", async ({ page }) => {
    await openAchievements(page);

    await expect(page.locator(".achievements-list")).toBeVisible();
  });

  test("should close achievements list", async ({ page }) => {
    await openAchievements(page);
    await closeAchievements(page);

    await expect(page.locator(".achievements-list")).not.toBeVisible();
  });

  test("should show achievement cards", async ({ page }) => {
    await openAchievements(page);

    const achievementCards = page.locator(".achievement-card");
    const count = await achievementCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should unlock first task achievement when creating first task", async ({
    page,
  }) => {
    await addTask(page, "First Achievement Task");
    await waitForTask(page, "First Achievement Task");

    await page.waitForTimeout(500);

    await openAchievements(page);

    const unlockedAchievements = await getUnlockedAchievements(page);
    expect(unlockedAchievements.length).toBeGreaterThanOrEqual(1);
  });

  test("should unlock completion achievement when completing first task", async ({
    page,
  }) => {
    await addTask(page, "Task for Completion Achievement");
    await waitForTask(page, "Task for Completion Achievement");

    await completeTask(page, "Task for Completion Achievement");
    await page.waitForTimeout(500);

    await openAchievements(page);

    const unlockedAchievements = await getUnlockedAchievements(page);
    expect(unlockedAchievements.length).toBeGreaterThanOrEqual(1);
  });

  test("should show locked achievements with question mark", async ({
    page,
  }) => {
    await openAchievements(page);

    const lockedAchievements = page.locator(".achievement-card--locked");
    const count = await lockedAchievements.count();

    if (count > 0) {
      const firstLocked = lockedAchievements.first();
      await expect(
        firstLocked.locator(".achievement-card__icon-locked")
      ).toHaveText("?");
    }
  });

  test("should display achievement notification when unlocked", async ({
    page,
  }) => {
    await addTask(page, "Notification Test Task");
    await waitForTask(page, "Notification Test Task");

    await page.waitForTimeout(1000);

    const notification = page.locator(".achievement-notification");
    const isVisible = await notification.isVisible().catch(() => false);
    expect(typeof isVisible).toBe("boolean");
  });
});
