import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent } from "@solidjs/testing-library";

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

vi.mock("@/services/ai", () => ({
  isConfigured: vi.fn(),
  refactorTask: vi.fn(),
}));

const mockTask = {
  id: "test-1",
  title: "Test Task",
  description: "Test Description",
  completed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("AIRefactorButton", () => {
  let AIRefactorButton: typeof import("@/components/ai/AIRefactorButton").default;
  let isConfigured: ReturnType<typeof vi.fn>;
  let refactorTask: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    mockLocalStorage.clear();

    const aiModule = await import("@/services/ai");
    isConfigured = aiModule.isConfigured as ReturnType<typeof vi.fn>;
    refactorTask = aiModule.refactorTask as ReturnType<typeof vi.fn>;

    const component = await import("@/components/ai/AIRefactorButton");
    AIRefactorButton = component.default;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("renders", () => {
    it("renders button when AI is configured", () => {
      isConfigured.mockReturnValue(true);
      const { container, unmount } = render(() => (
        <AIRefactorButton task={mockTask} onRefactor={vi.fn()} />
      ));
      expect(container.querySelector(".task-ai-btn")).toBeInTheDocument();
      unmount();
    });

    it("does not render when AI is not configured", () => {
      isConfigured.mockReturnValue(false);
      const { container, unmount } = render(() => (
        <AIRefactorButton task={mockTask} onRefactor={vi.fn()} />
      ));
      expect(container.querySelector(".task-ai-btn")).not.toBeInTheDocument();
      unmount();
    });

    it("displays AI icon when not loading", () => {
      isConfigured.mockReturnValue(true);
      const { container, unmount } = render(() => (
        <AIRefactorButton task={mockTask} onRefactor={vi.fn()} />
      ));
      expect(container.querySelector(".task-ai-btn svg")).toBeInTheDocument();
      unmount();
    });

    it("has correct title attribute", () => {
      isConfigured.mockReturnValue(true);
      const { container, unmount } = render(() => (
        <AIRefactorButton task={mockTask} onRefactor={vi.fn()} />
      ));
      expect(container.querySelector(".task-ai-btn")).toHaveAttribute(
        "title",
        "AI Refactor"
      );
      unmount();
    });
  });

  describe("disabled state when not configured", () => {
    it("button is not in DOM when not configured", () => {
      isConfigured.mockReturnValue(false);
      const { queryByTitle, unmount } = render(() => (
        <AIRefactorButton task={mockTask} onRefactor={vi.fn()} />
      ));
      expect(queryByTitle("AI Refactor")).not.toBeInTheDocument();
      unmount();
    });

    it("isConfigured is called on render", () => {
      isConfigured.mockReturnValue(true);
      const { unmount } = render(() => (
        <AIRefactorButton task={mockTask} onRefactor={vi.fn()} />
      ));
      expect(isConfigured).toHaveBeenCalled();
      unmount();
    });
  });

  describe("click handling", () => {
    it("calls refactorTask when clicked", async () => {
      isConfigured.mockReturnValue(true);
      refactorTask.mockResolvedValue({
        title: "New Title",
        description: "New Desc",
      });
      const { container, unmount } = render(() => (
        <AIRefactorButton task={mockTask} onRefactor={vi.fn()} />
      ));
      const btn = container.querySelector(".task-ai-btn");
      if (btn) {
        await fireEvent.click(btn);
      }
      expect(refactorTask).toHaveBeenCalledWith(mockTask);
      unmount();
    });

    it("calls onRefactor with result", async () => {
      isConfigured.mockReturnValue(true);
      const mockResult = { title: "New Title", description: "New Desc" };
      refactorTask.mockResolvedValue(mockResult);
      const onRefactor = vi.fn();
      const { container, unmount } = render(() => (
        <AIRefactorButton task={mockTask} onRefactor={onRefactor} />
      ));
      const btn = container.querySelector(".task-ai-btn");
      if (btn) {
        await fireEvent.click(btn);
      }
      expect(onRefactor).toHaveBeenCalledWith(mockResult);
      unmount();
    });

    it("shows loading state when clicked", async () => {
      isConfigured.mockReturnValue(true);
      refactorTask.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      const { container, unmount } = render(() => (
        <AIRefactorButton task={mockTask} onRefactor={vi.fn()} />
      ));
      const btn = container.querySelector(".task-ai-btn");
      if (btn) {
        await fireEvent.click(btn);
      }
      expect(container.querySelector(".task-ai-btn")).toHaveAttribute(
        "disabled"
      );
      unmount();
    });

    it("does not call refactorTask when already loading", async () => {
      isConfigured.mockReturnValue(true);
      refactorTask.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      const { container, unmount } = render(() => (
        <AIRefactorButton task={mockTask} onRefactor={vi.fn()} />
      ));
      const btn = container.querySelector(".task-ai-btn") as HTMLElement;
      if (btn) {
        await fireEvent.click(btn);
        await fireEvent.click(btn);
      }
      expect(refactorTask).toHaveBeenCalledTimes(1);
      unmount();
    });
  });
});
