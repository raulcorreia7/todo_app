/**
 * AI Providers Module
 * Single LLM7 provider for todo refactoring.
 * Preserves class/window singleton API.
 */

/* global fetch */

// Internal constants and logging guard
const AI_CFG = Object.freeze({
  MODEL: "gpt-4o-mini-2024-07-18",
  BASE_URL: "https://api.llm7.io/v1",
  API_KEY: "+7WA+v1Gdie9whBlV2tUOjCE8SyF7Klaawfp0Obh4P5r07vx9hYHGSwzvr1Qpxvnnqvo5cBrQ9OXnAVOjb46CsejOp97rxqob722N87LgJrgdzg8kI3GPmEwpLat" // LLM7 is keyless; kept for interface compatibility
});
const AI_LOG = true;

function log(...args) {
  if (AI_LOG)
    try {
    } catch (_) {}
}
function warn(...args) {
  if (AI_LOG)
    try {
      console.warn(...args);
    } catch (_) {}
}
function err(...args) {
  try {
    console.error(...args);
  } catch (_) {}
}

// Utility: sanitize strings for prompt display (no quotes escaping needed since we don't embed in JSON)
function toStringSafe(v) {
  return String(v == null ? "" : v);
}

// Title polishing: keep meaning, remove filler, normalize spacing/case, trim punctuation
function polishTitle(raw) {
  let s = toStringSafe(raw).trim();
  s = s.replace(/\s+/g, " ");
  s = s.replace(/[\u2013\u2014]/g, "-"); // normalize dashes
  s = s.replace(/\s*([:;,.!?])\s*/g, "$1 "); // tidy punctuation spacing
  s = s.replace(/[!?.]{2,}$/g, (match) => match[0]); // reduce repeated punct at end
  s = s.replace(/^\W+|\W+$/g, ""); // strip leading/trailing non-word
  // Sentence case but preserve ALLCAPS words/acronyms
  if (s) {
    const first = s.charAt(0).toUpperCase();
    const rest = s.slice(1);
    s = first + rest.replace(/\b([A-Z])([a-z]+)\b/g, (m, a, b) => a + b); // keep existing capitalization mostly
  }
  return s;
}


class LLM7Provider {
  constructor() {
    this.apiKey = AI_CFG.API_KEY;
    this.model = AI_CFG.MODEL;
    this.baseUrl = AI_CFG.BASE_URL;
  }

  buildTodoRefactorMessages(todo) {
    try {
      const idVal = todo && todo.id != null ? todo.id : null;
      const rawTitle = (todo && (todo.text != null ? todo.text : todo.title)) || "";
      const rawDescription = (todo && todo.description != null ? todo.description : "");

      const systemMsg = {
        role: "system",
        content: [
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
        ].join("\n"),
      };

      // Escape input only, no extra normalization or preview shaping here
      const inputTodo = {
        id: idVal,
        title: toStringSafe(rawTitle),
        description: toStringSafe(rawDescription)
      };

      const userMsg = {
        role: "user",
        content: JSON.stringify({ todo: inputTodo })
      };

      return [systemMsg, userMsg];
    } catch (e) {
      err("LLM7Provider.buildTodoRefactorMessages failed:", e);
      return [];
    }
  }

  parseModelJSON(content) {
    try {
      if (typeof content !== "string") return null;
      const text = content.trim();

      // Try strict JSON parse first
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        // If the model returned extra prose, extract the first JSON object region
        const firstBrace = text.indexOf("{");
        const lastBrace = text.lastIndexOf("}");
        if (firstBrace === -1 || lastBrace === -1) return null;
        const sliced = text.slice(firstBrace, lastBrace + 1);
        parsed = JSON.parse(sliced);
      }

      // Accept either a direct object with expected keys or a wrapper shape
      // 1) Direct: { id, title, description }
      // 2) Wrapper: { result: { id, title, description } } or { data: { ... } }
      let obj = parsed;
      if (obj && typeof obj === "object" && !("id" in obj) && ("todo" in obj || "result" in obj || "data" in obj)) {
        obj = obj.result || obj.data || obj.todo;
      }

      if (!obj || typeof obj !== "object") return null;
      if (!("id" in obj) || !("title" in obj) || !("description" in obj)) return null;

      // Escape output only; do not rewrite meaning
      const id = obj.id;
      const title = toStringSafe(obj.title);
      const description = toStringSafe(obj.description);

      return { id, title, description };
    } catch (e) {
      err("LLM7Provider.parseModelJSON failed:", e);
      return null;
    }
  }

  async refactorTodo(todo) {
    if (typeof this.buildTodoRefactorMessages !== "function") {
      err("Critical: buildTodoRefactorMessages undefined!");
      return null;
    }
    try {
      const debugId = todo && todo.__debugId;
      const messages = this.buildTodoRefactorMessages(todo);
      const payload = { model: this.model, messages, stream: false };


      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      })
        .then(async (r) => {
          try {
          } catch (_) {}
          return r;
        })
        .catch((e) => {
          err("[AI] fetch error:", e, { debugId });
          throw e;
        });

      if (!res || !res.ok) {
        let bodyText = "";
        try {
          bodyText = await res.text();
        } catch (_) {}
        throw new Error(
          `llm7 API error: ${res ? res.status : "unknown"} ${
            res ? res.statusText : ""
          } ${bodyText ? "- " + bodyText : ""}`
        );
      }

      const data = await res.json();
      const content =
        data &&
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
          ? data.choices[0].message.content
          : null;

      if (!content) {
        err("llm7: missing content in response", { debugId });
        return null;
      }

      const parsed = this.parseModelJSON(content);

      // Enforce id consistency if input has an id
      if (parsed && todo && "id" in todo) {
        try {
          const inputId = todo.id;
          if (typeof inputId !== "undefined" && inputId !== null) {
            if (JSON.stringify(parsed.id) !== JSON.stringify(inputId)) {
              warn("llm7: parsed id does not match input id", {
                debugId,
                inputId,
                parsedId: parsed.id,
              });
              return null;
            }
          }
        } catch (_) {
          return null;
        }
      }

      return parsed;
    } catch (err0) {
      err("llm7 network/error:", err0);
      return null;
    }
  }
}

class AIProviders {
  constructor() {
    this.provider = new LLM7Provider();
    try {
      console.assert(
        typeof this.refactorTodo === "function",
        "refactorTodo method missing!"
      );
    } catch (_) {}
  }

  async refactorTodo(todo) {
    try {
    } catch (_) {}

    // Ensure we only pass a pure JSON structure through the provider
    const safe = {
      id: todo && todo.id != null ? todo.id : null,
      title: toStringSafe(todo && (todo.text != null ? todo.text : todo.title)),
      description: toStringSafe(todo && todo.description)
    };

    const result = await this.provider.refactorTodo(safe);
    return result;
  }

  // Keep method for API parity; use a deterministic local cleanup as fallback
  async refactorText(text, style = "simple", options = {}) {
    return this.fallbackRefactor(text);
  }

  // Local deterministic formatter for simple cases
  fallbackRefactor(text) {
    const s = toStringSafe(text).trim().replace(/\s+/g, " ");
    return polishTitle(s);
  }

  isAvailable() {
    // LLM7 is keyless; always available
    return true;
  }
}

// Singleton/export
const aiProviders = new AIProviders();

// Global exposure for app integration
try {
  window.AIProviders = aiProviders;
  window.AIProvidersReady = true;
} catch (_) {}

// Provider readiness audit (top-level, on load)
try {
} catch (_) {}
