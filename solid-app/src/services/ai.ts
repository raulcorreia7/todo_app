import type { Task } from "@/types";

export interface RefactorResult {
  title: string;
  description: string;
  suggestions?: string[];
}

const ENDPOINT = "https://api.llm7.io/v1/chat/completions";
const MODEL = "gpt-4o-mini";

function getApiKey(): string | undefined {
  return import.meta.env.VITE_LLM7_API_KEY;
}

export function isConfigured(): boolean {
  const key = getApiKey();
  return typeof key === "string" && key.length > 0;
}

function buildRefactorMessages(task: Task): Array<{ role: string; content: string }> {
  const systemContent = [
    "You are a precision noise removal specialist and clarity enhancer.",
    "Task: Convert an input JSON object representing a todo item into a JSON object with exactly the keys: id, title, description.",
    "Core mission: Find a sweet spot remove noise while preserving 100% of the original meaning and substance.",
    "Guidelines:",
    "- id must match the input id (same value and type).",
    "- title: Remove ALL noise and filler words aggressively. Preserve only the core meaning and essential information. Cut out: um, uh, like, just, really, basically, actually, sort of, kind of, unnecessary adverbs, redundant phrases. Keep the exact same meaning, just cleaner and more direct.",
    "- description: Aggressively eliminate noise, repetition, and irrelevant content. Preserve all substantive information, steps, and context. Remove: filler words, redundant explanations, obvious statements, irrelevant details, wordiness. Keep all meaningful content while making it concise and clear, unless disconnected to the title.",
    "- If the description becomes empty after refactoring, return the original description instead of an empty string.",
    "- Your primary goal is noise removal and clarity improvement. The output must be as be as close to the same meaning and information as the input, but stripped of all non-essential elements.",
    "- If the description is empty, even after refactoring, and there is a relevant title that is absolutely not noise, generate a description.",
    "- If possible the description should be short, sweet, clean, professional, zen, subtle, premium.",
    "- If the description can be broken down to bullet points, do it, and use new lines.",
    "- Fully refactor the description if its completly disconnected from the title.",
    "- Do not include any additional keys or metadata.",
    "- Output must be a single JSON object only (no explanations or code fences).",
  ].join("\n");

  const inputTodo = {
    id: task.id,
    title: task.title || "",
    description: task.description || "",
  };

  return [
    { role: "system", content: systemContent },
    { role: "user", content: JSON.stringify({ todo: inputTodo }) },
  ];
}

function parseModelJSON(content: string): RefactorResult | null {
  try {
    const text = content.trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) return null;
      const sliced = text.slice(firstBrace, lastBrace + 1);
      parsed = JSON.parse(sliced);
    }

    let obj = parsed as Record<string, unknown>;
    if (
      obj &&
      typeof obj === "object" &&
      !("id" in obj) &&
      ("todo" in obj || "result" in obj || "data" in obj)
    ) {
      obj = (obj.result || obj.data || obj.todo) as Record<string, unknown>;
    }

    if (!obj || typeof obj !== "object") return null;
    if (!("id" in obj) || !("title" in obj) || !("description" in obj)) return null;

    const title = String(obj.title ?? "");
    const description = String(obj.description ?? "");

    return { title, description };
  } catch (e) {
    console.error("AI parseModelJSON failed:", e);
    return null;
  }
}

export async function refactorTask(task: Task): Promise<RefactorResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("AI: API key not configured");
    return null;
  }

  try {
    const messages = buildRefactorMessages(task);
    const payload = { model: MODEL, messages, stream: false };

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res || !res.ok) {
      let bodyText = "";
      try {
        bodyText = await res.text();
      } catch (e) { void e }
      console.error(`AI API error: ${res?.status || "unknown"} ${res?.statusText || ""} ${bodyText ? "- " + bodyText : ""}`);
      return null;
    }

    const data = await res.json();
    const content: string | null =
      data?.choices?.[0]?.message?.content ?? null;

    if (!content) {
      console.error("AI: missing content in response");
      return null;
    }

    const parsed = parseModelJSON(content);

    if (parsed && task.id) {
      const parsedObj = JSON.parse(content);
      const parsedId = parsedObj?.id;
      if (JSON.stringify(parsedId) !== JSON.stringify(task.id)) {
        console.warn("AI: parsed id does not match input id", { inputId: task.id, parsedId });
        return null;
      }
    }

    return parsed;
  } catch (e) {
    console.error("AI refactorTask error:", e);
    return null;
  }
}

function buildSubtaskMessages(task: Task): Array<{ role: string; content: string }> {
  const systemContent = [
    "You are a task breakdown specialist.",
    "Given a task, suggest 3-5 logical subtasks that would help complete it.",
    "Return ONLY a JSON array of strings, each string being a subtask title.",
    "No explanations, no code fences, just the JSON array.",
  ].join("\n");

  return [
    { role: "system", content: systemContent },
    { role: "user", content: JSON.stringify({ task: { title: task.title, description: task.description } }) },
  ];
}

export async function suggestSubtasks(task: Task): Promise<string[] | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("AI: API key not configured");
    return null;
  }

  try {
    const messages = buildSubtaskMessages(task);
    const payload = { model: MODEL, messages, stream: false };

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res || !res.ok) {
      console.error(`AI API error: ${res?.status || "unknown"}`);
      return null;
    }

    const data = await res.json();
    const content: string | null =
      data?.choices?.[0]?.message?.content ?? null;

    if (!content) {
      console.error("AI: missing content in response");
      return null;
    }

    const text = content.trim();
    const firstBracket = text.indexOf("[");
    const lastBracket = text.lastIndexOf("]");
    if (firstBracket === -1 || lastBracket === -1) return null;

    const sliced = text.slice(firstBracket, lastBracket + 1);
    const parsed = JSON.parse(sliced);

    if (!Array.isArray(parsed)) return null;

    return parsed.filter((item): item is string => typeof item === "string");
  } catch (e) {
    console.error("AI suggestSubtasks error:", e);
    return null;
  }
}
