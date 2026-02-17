import { Hono } from "hono";
import { serve } from "@hono/node-server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b:free";

const REFACTOR_PROMPT = `You are a precision noise removal specialist and clarity enhancer. Task: Convert an input JSON object representing a todo item into a JSON object with exactly the keys: id, title, description. Core mission: Find a sweet spot remove noise while preserving 100% of the original meaning and substance. Guidelines: - id must match the input id (same value and type). - title: Remove ALL noise and filler words aggressively. Preserve only the core meaning and essential information. Cut out: um, uh, like, just, really, basically, actually, sort of, kind of, unnecessary adverbs, redundant phrases. Keep the exact same meaning, just cleaner and more direct. - description: Aggressively eliminate noise, repetition, and irrelevant content. Preserve all substantive information, steps, and context. Remove: filler words, redundant explanations, obvious statements, irrelevant details, wordiness. Keep all meaningful content while making it concise and clear, unless disconnected to the title. - If the description becomes empty after refactoring, return the original description instead of an empty string. - Your primary goal is noise removal and clarity improvement. The output must be as be as close to the same meaning and information as the input, but stripped of all non-essential elements. - If the description is empty, even after refactoring, and there is a relevant title that is absolutely not noise, generate a description. - If possible the description should be short, sweet, clean, professional, zen, subtle, premium. - If the description can be broken down to bullet points, do it, and use new lines. - Fully refactor the description if its completly disconnected from the title. - Do not include any additional keys or metadata. - Output must be a single JSON object only (no explanations or code fences).`;

const SUBTASKS_PROMPT = `You are a task breakdown specialist. Given a task, suggest 3-5 logical subtasks that would help complete it. Return ONLY a JSON array of strings, each string being a subtask title. No explanations, no code fences, just the JSON array.`;

const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error("ERROR: OPENROUTER_API_KEY environment variable is required");
  process.exit(1);
}

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

async function callOpenRouter(systemPrompt: string, userMessage: object) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "HTTP-Referer": "https://luxtodo.raulcorreia.dev",
      "X-Title": "Luxury Todo",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(userMessage) },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content in OpenRouter response");
  }

  return content;
}

app.post("/api/ai/refactor", async (c) => {
  try {
    const body = await c.req.json();
    const { task } = body;

    if (!task || typeof task.id === "undefined" || !task.title) {
      return c.json(
        { error: "Missing required fields: task.id, task.title" },
        400
      );
    }

    const content = await callOpenRouter(REFACTOR_PROMPT, { todo: task });

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return c.json({ error: "Failed to parse AI response as JSON" }, 500);
    }

    return c.json({
      title: parsed.title,
      description: parsed.description ?? "",
    });
  } catch (error) {
    console.error("Refactor error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

app.post("/api/ai/subtasks", async (c) => {
  try {
    const body = await c.req.json();
    const { task } = body;

    if (!task || !task.title) {
      return c.json({ error: "Missing required field: task.title" }, 400);
    }

    const content = await callOpenRouter(SUBTASKS_PROMPT, { task });

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return c.json({ error: "Failed to parse AI response as JSON" }, 500);
    }

    if (!Array.isArray(parsed)) {
      return c.json({ error: "AI response is not an array" }, 500);
    }

    return c.json({ subtasks: parsed });
  } catch (error) {
    console.error("Subtasks error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: message }, 500);
  }
});

const port = Number(process.env.PORT) || 3000;

console.log(`Server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
