import type { Task } from "@/types";

export interface RefactorResult {
  title: string;
  description: string;
  suggestions?: string[];
}

const API_BASE = "https://api.luxtodo.raulcorreia.dev";

export function isConfigured(): boolean {
  return true;
}

export async function refactorTask(task: Task): Promise<RefactorResult | null> {
  try {
    const res = await fetch(`${API_BASE}/api/ai/refactor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task }),
    });

    if (!res || !res.ok) {
      let bodyText = "";
      try {
        bodyText = await res.text();
      } catch (e) {
        void e;
      }
      console.error(
        `AI API error: ${res?.status || "unknown"} ${res?.statusText || ""} ${bodyText ? "- " + bodyText : ""}`
      );
      return null;
    }

    const data = await res.json();

    if (data?.error) {
      console.error("AI: server error:", data.error);
      return null;
    }

    if (!data?.title || typeof data.title !== "string") {
      console.error("AI: missing title in response");
      return null;
    }

    return { title: data.title, description: data.description ?? "" };
  } catch (e) {
    console.error("AI refactorTask error:", e);
    return null;
  }
}

export async function suggestSubtasks(task: Task): Promise<string[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/ai/subtasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task }),
    });

    if (!res || !res.ok) {
      let bodyText = "";
      try {
        bodyText = await res.text();
      } catch (e) {
        void e;
      }
      console.error(
        `AI API error: ${res?.status || "unknown"} ${res?.statusText || ""} ${bodyText ? "- " + bodyText : ""}`
      );
      return null;
    }

    const data = await res.json();

    if (data?.error) {
      console.error("AI: server error:", data.error);
      return null;
    }

    if (!Array.isArray(data?.subtasks)) {
      console.error("AI: missing subtasks array in response");
      return null;
    }

    return data.subtasks.filter(
      (item: unknown): item is string => typeof item === "string"
    );
  } catch (e) {
    console.error("AI suggestSubtasks error:", e);
    return null;
  }
}
