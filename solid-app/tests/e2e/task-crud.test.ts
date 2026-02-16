import { test, expect } from "@playwright/test";
import {
  addTask,
  waitForTask,
  getTaskCount,
  editTask,
  completeTask,
  deleteTask,
  setFilter,
  clearCompletedTasks,
  deleteAllTasks,
  clearLocalStorage,
} from "./helpers";

test.describe("Task CRUD Operations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearLocalStorage(page);
    await page.reload();
  });

  test("should add a new task", async ({ page }) => {
    await addTask(page, "Test Task", "Test Description");

    const task = await waitForTask(page, "Test Task");
    await expect(task).toBeVisible();
    await expect(task.locator("h3")).toHaveText("Test Task");
    await expect(task.locator("p")).toHaveText("Test Description");
  });

  test("should add a task without description", async ({ page }) => {
    await addTask(page, "Simple Task");

    const task = await waitForTask(page, "Simple Task");
    await expect(task).toBeVisible();
    await expect(task.locator("h3")).toHaveText("Simple Task");
  });

  test("should edit a task", async ({ page }) => {
    await addTask(page, "Original Task", "Original Description");
    await waitForTask(page, "Original Task");

    await editTask(page, "Original Task", "Edited Task", "Edited Description");

    const editedTask = await waitForTask(page, "Edited Task");
    await expect(editedTask).toBeVisible();
    await expect(editedTask.locator("h3")).toHaveText("Edited Task");
    await expect(editedTask.locator("p")).toHaveText("Edited Description");
  });

  test("should complete a task", async ({ page }) => {
    await addTask(page, "Task to Complete");
    const task = await waitForTask(page, "Task to Complete");

    await completeTask(page, "Task to Complete");

    await expect(task).toHaveClass(/task-item--completed/);
    const checkbox = task.locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();
  });

  test("should uncomplete a task", async ({ page }) => {
    await addTask(page, "Task to Toggle");
    await waitForTask(page, "Task to Toggle");

    await completeTask(page, "Task to Toggle");
    await completeTask(page, "Task to Toggle");

    const task = await waitForTask(page, "Task to Toggle");
    await expect(task).not.toHaveClass(/task-item--completed/);
  });

  test("should delete a task", async ({ page }) => {
    await addTask(page, "Task to Delete");
    await waitForTask(page, "Task to Delete");

    expect(await getTaskCount(page)).toBe(1);

    await deleteTask(page, "Task to Delete");

    expect(await getTaskCount(page)).toBe(0);
  });

  test("should add multiple tasks", async ({ page }) => {
    await addTask(page, "Task 1");
    await addTask(page, "Task 2");
    await addTask(page, "Task 3");

    await waitForTask(page, "Task 1");
    await waitForTask(page, "Task 2");
    await waitForTask(page, "Task 3");

    expect(await getTaskCount(page)).toBe(3);
  });
});

test.describe("Task Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearLocalStorage(page);
    await page.reload();

    await addTask(page, "Active Task 1");
    await addTask(page, "Active Task 2");
    await addTask(page, "Completed Task 1");
    await addTask(page, "Completed Task 2");

    await waitForTask(page, "Completed Task 1");
    await waitForTask(page, "Completed Task 2");

    await completeTask(page, "Completed Task 1");
    await completeTask(page, "Completed Task 2");
  });

  test("should filter to show all tasks", async ({ page }) => {
    await setFilter(page, "all");

    expect(await getTaskCount(page)).toBe(4);
  });

  test("should filter to show only active tasks", async ({ page }) => {
    await setFilter(page, "active");

    expect(await getTaskCount(page)).toBe(2);
    await expect(
      page.locator(".task-item", { hasText: "Active Task 1" })
    ).toBeVisible();
    await expect(
      page.locator(".task-item", { hasText: "Active Task 2" })
    ).toBeVisible();
  });

  test("should filter to show only completed tasks", async ({ page }) => {
    await setFilter(page, "completed");

    expect(await getTaskCount(page)).toBe(2);
    await expect(
      page.locator(".task-item", { hasText: "Completed Task 1" })
    ).toBeVisible();
    await expect(
      page.locator(".task-item", { hasText: "Completed Task 2" })
    ).toBeVisible();
  });
});

test.describe("Clear Completed Tasks", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearLocalStorage(page);
    await page.reload();
  });

  test("should clear all completed tasks", async ({ page }) => {
    await addTask(page, "Active Task");
    await addTask(page, "Completed Task");

    await waitForTask(page, "Completed Task");
    await completeTask(page, "Completed Task");

    await setFilter(page, "all");
    expect(await getTaskCount(page)).toBe(2);

    await clearCompletedTasks(page);

    await page.waitForTimeout(200);
    expect(await getTaskCount(page)).toBe(1);
    await expect(
      page.locator(".task-item", { hasText: "Active Task" })
    ).toBeVisible();
  });

  test("should clear all tasks", async ({ page }) => {
    await addTask(page, "Task 1");
    await addTask(page, "Task 2");
    await addTask(page, "Task 3");

    await waitForTask(page, "Task 3");
    expect(await getTaskCount(page)).toBe(3);

    await deleteAllTasks(page);

    await page.waitForTimeout(200);
    expect(await getTaskCount(page)).toBe(0);
  });
});
