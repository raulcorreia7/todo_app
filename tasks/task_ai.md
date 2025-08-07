# Task AI Implementation Plan

## 🚀 Objective
Replace mlvoca.com with the llm7.io OpenAI-compatible API to enable users to click “Refactor” on a todo item and send it to model `deepseek-r1-0528` to polish the title and convert the description into bullet points. The model must respond as pure JSON with fields: `id` (same as input), `title` (string), `description` (array of bullet strings). Use standard Chat Completions without streaming.

---

## 📡 API Reference: llm7.io (OpenAI-compatible)

- Base URL: `https://api.llm7.io/v1`
- Endpoint: `POST /chat/completions`
- Required Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer unused`
- Request Body:
  - `model: "deepseek-r1-0528"`
  - `messages: [...]` (OpenAI Chat format)
  - `stream: false`
- Response Path:
  - `data.choices[0].message.content` (string; expected to be JSON text per our prompt)

---

## 📝 Prompt Design

Messages (Chat format):

- system:
  - Instruct the model to act as a refactoring assistant that:
    - Polishes and cleans up the todo title.
    - Converts the description to clear bullet points.
    - Responds strictly with a JSON object: `{ "id": <same id>, "title": <string>, "description": <string[]> }`.
    - No extra commentary, no code fences, no markdown—pure JSON only.
- user:
  - Provide the todo payload and explicit instructions that mirror the original intent:

```
Refactor this todo item:

```json
"todo": {
  "id": <id>,
  "title": "<title>",
  "description": "<description>"
}
```

Tasks:
1) Polish and clean up the title.
2) Convert the description into bullet points (concise string array).

Return ONLY a JSON object with fields:
- id (must be the same as input)
- title (string)
- description (array of strings)

Do not include any text before or after the JSON. No markdown, no code fences, and no explanations.
```

Notes:
- The assistant must produce pure JSON so the client can do `JSON.parse` directly.
- We will validate that `id` matches and `description` is an array of strings.

---

## 🧪 Implementation Snippet (Browser JS, fetch; no ESM)

```js
/* global fetch */
function buildMessages(todo) {
  var systemMsg = {
    role: "system",
    content: [
      "You are a refactoring assistant.",
      "Requirements:",
      "- Polish and clean up the todo title.",
      "- Convert the description to bullet points (concise string array).",
      "- Respond with pure JSON only with fields: id, title, description (array of strings).",
      "- Do not include any text before or after the JSON. No markdown or code fences."
    ].join("\n")
  };

  var userMsg = {
    role: "user",
    content: [
      "Refactor this todo item:",
      "",
      "```json",
      "\"todo\": {",
      "  \"id\": " + todo.id + ",",
      "  \"title\": \"" + String(todo.title).replace(/"/g, '\\"') + "\",",
      "  \"description\": \"" + String(todo.description).replace(/"/g, '\\"') + "\"",
      "}",
      "```",
      "",
      "Tasks:",
      "1) Polish and clean up the title.",
      "2) Convert the description into bullet points (concise string array).",
      "",
      "Return ONLY a JSON object with fields:",
      "- id (must be the same as input)",
      "- title (string)",
      "- description (array of strings)",
      "",
      "Do not include any text before or after the JSON. No markdown, no code fences, and no explanations."
    ].join("\n")
  };

  return [systemMsg, userMsg];
}

function isStringArray(arr) {
  if (!Array.isArray(arr)) return false;
  for (var i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== "string") return false;
  }
  return true;
}

async function refactorTodoBrowser(todo) {
  var messages = buildMessages(todo);

  var resp = await fetch("https://api.llm7.io/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer unused"
    },
    body: JSON.stringify({
      model: "deepseek-r1-0528",
      messages: messages,
      stream: false
    })
  });

  if (!resp.ok) {
    console.error("HTTP error:", resp.status, resp.statusText);
    return null;
  }

  var data = await resp.json();
  try {
    var content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (typeof content !== "string") {
      console.error("Unexpected content type:", content);
      return null;
    }
    var result = JSON.parse(content);

    if (result == null || typeof result !== "object") return null;
    if (result.id !== todo.id) {
      console.error("ID mismatch:", result.id, "!==", todo.id);
      return null;
    }
    if (typeof result.title !== "string") {
      console.error("Invalid title");
      return null;
    }
    if (!isStringArray(result.description)) {
      console.error("Invalid description array");
      return null;
    }

    return result;
  } catch (e) {
    console.error("Invalid JSON from model:", e);
    return null;
  }
}
```

---

## 🧪 Implementation Snippet (Node.js https; CommonJS, no deps)

```js
// Node.js CommonJS, built-in https only
// Usage: refactorTodoNode(todo, (err, updated) => { ... });

var https = require("https");

function postChatCompletions(body, cb) {
  var json = JSON.stringify(body);

  var options = {
    hostname: "api.llm7.io",
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer unused",
      "Content-Length": Buffer.byteLength(json)
    }
  };

  var req = https.request(options, function (res) {
    var chunks = [];
    res.on("data", function (d) { chunks.push(d); });
    res.on("end", function () {
      var buf = Buffer.concat(chunks).toString("utf8");
      if (res.statusCode < 200 || res.statusCode >= 300) {
        var err = new Error("HTTP " + res.statusCode + ": " + buf);
        err.statusCode = res.statusCode;
        return cb(err);
      }
      try {
        var parsed = JSON.parse(buf);
        return cb(null, parsed);
      } catch (e) {
        return cb(new Error("Failed to parse response JSON: " + e.message));
      }
    });
  });

  req.on("error", function (err) {
    cb(err);
  });

  req.write(json);
  req.end();
}

function buildMessages(todo) {
  var systemMsg = {
    role: "system",
    content: [
      "You are a refactoring assistant.",
      "Requirements:",
      "- Polish and clean up the todo title.",
      "- Convert the description to bullet points (concise string array).",
      "- Respond with pure JSON only with fields: id, title, description (array of strings).",
      "- Do not include any text before or after the JSON. No markdown or code fences."
    ].join("\n")
  };

  var userMsg = {
    role: "user",
    content: [
      "Refactor this todo item:",
      "",
      "```json",
      "\"todo\": {",
      "  \"id\": " + todo.id + ",",
      "  \"title\": \"" + String(todo.title).replace(/\"/g, '\\"') + "\",",
      "  \"description\": \"" + String(todo.description).replace(/\"/g, '\\"') + "\"",
      "}",
      "```",
      "",
      "Tasks:",
      "1) Polish and clean up the title.",
      "2) Convert the description into bullet points (concise string array).",
      "",
      "Return ONLY a JSON object with fields:",
      "- id (must be the same as input)",
      "- title (string)",
      "- description (array of strings)",
      "",
      "Do not include any text before or after the JSON. No markdown, no code fences, and no explanations."
    ].join("\n")
  };

  return [systemMsg, userMsg];
}

function isStringArray(arr) {
  if (!Array.isArray(arr)) return false;
  for (var i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== "string") return false;
  }
  return true;
}

function refactorTodoNode(todo, cb) {
  var messages = buildMessages(todo);

  var body = {
    model: "deepseek-r1-0528",
    messages: messages,
    stream: false
  };

  postChatCompletions(body, function (err, data) {
    if (err) return cb(err);

    try {
      var content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (typeof content !== "string") {
        return cb(new Error("Unexpected content type"));
      }
      var result = JSON.parse(content);

      if (!result || typeof result !== "object") {
        return cb(new Error("Invalid result object"));
      }
      if (result.id !== todo.id) {
        return cb(new Error("ID mismatch"));
      }
      if (typeof result.title !== "string") {
        return cb(new Error("Invalid title"));
      }
      if (!isStringArray(result.description)) {
        return cb(new Error("Invalid description array"));
      }

      cb(null, result);
    } catch (e) {
      cb(new Error("Failed to parse/validate model JSON: " + e.message));
    }
  });
}

module.exports = {
  refactorTodoNode: refactorTodoNode
};
```

---

## 🔄 UI Integration Flow

1. User clicks Refactor on a todo item.
2. Disable the Refactor button (or debounce) while the request is pending.
3. Call the refactor function (browser: `refactorTodoBrowser(todo)`; node: `refactorTodoNode(todo, cb)`).
4. If a valid result returns (same `id`, `title` is string, `description` is string array), overwrite the original todo with the new values.
5. Re-enable the button and refresh the UI.

---

## 🔧 Error Handling & Edge Cases

- Non-2xx HTTP responses: keep the original todo and log the error.
- If parsing fails or the JSON is invalid: keep the original, log the issue.
- Validate `id` matches input; `description` must be an array of strings.
- Disable or debounce the Refactor button while a request is in-flight to avoid duplicates.
- Use `stream: false` to receive a single JSON content block that can be parsed directly.

---

## ✅ Testing

- Sample todo:
  - `{ id: 1, title: "buy milk", description: "get milk 2l from store" }`
- Expect:
  - Improved title (e.g., "Buy 2L Milk")
  - `description` as an array of concise bullet strings (e.g., `["Check brand", "Buy 2L milk", "Save receipt"]`)
  - `id` remains `1`

---

## 📋 Summary Table

| Step               | Description                                                           |
|--------------------|-----------------------------------------------------------------------|
| API Endpoint       | `POST https://api.llm7.io/v1/chat/completions`                        |
| Model              | `deepseek-r1-0528`                                                    |
| Request Format     | OpenAI Chat Completions (`model`, `messages`, `stream: false`)        |
| Response Path      | `choices[0].message.content` (string JSON to parse)                   |
| Prompt             | System+User instructing pure JSON with id/title/description[]         |
| Browser Impl       | `fetch` (no ESM), parse `content`, validate and apply                  |
| Node Impl          | Built-in `https` (CommonJS), helper + callback, no streaming          |
| Integration Action | Overwrite todo with validated response object                          |
| Error Handling     | HTTP errors, parsing errors, validation on `id` and `description[]`   |

---

## 🧠 Notes & References

- Authorization header uses `Bearer unused` for examples. You can obtain a free key at `https://token.llm7.io/` for higher rate limits, but keep `Authorization: Bearer unused` in these snippets as requested.
- No ESM and no external libraries in either example.
- Use `stream: false` to simplify parsing.