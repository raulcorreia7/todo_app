
# Task AI Implementation Plan

## 🚀 Objective
Enable users to click “Refactor” on a todo item and send it to the **mlvoca.com** API (model `deepseek-r1:1.5b`) for polishing title and formatting description into bullet points. Then overwrite the original todo object with the AI response.

---

## 📡 API Reference: mlvoca.com

- **Base URL**: `https://mlvoca.com`  
- **Endpoint**: `POST /api/generate`
- **Available Models**:  
  - `tinyllama`  
  - `deepseek-r1:1.5b`  
- **Request Params**:  
  - `model` *(required)*  
  - `prompt` *(required)*  
  - `stream` *(bool, default true)*  
  - `format` (e.g. `"json"`)  
  - Optional: `suffix`, `options`, `system`, `template`, `raw`  

---

## 📝 Prompt **Design**

```
Refactor this todo item:
```json
"todo": {
  "id": <id>,
  "title": "<title>",
  "description": "<description>"
}
```
Polish and clean up the title.
Make the description as bullet points.
Respond with a JSON object: same id, refined title, description as bullet points.
```

---

## 🧪 Implementation Snippet (Browser JS)

```js
async function refactorTodo(todo) {
  const prompt = `
Refactor this todo item:
\`\`\`json
"todo": {
  "id": ${todo.id},
  "title": "${todo.title}",
  "description": "${todo.description}"
}
\`\`\`
Polish and clean up the title.
Make the description as bullet points.
Respond with a JSON object: same id, refined title, description as bullet points.
`;
  const resp = await fetch("https://mlvoca.com/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-r1:1.5b",
      prompt,
      stream: false,
      format: "json"
    })
  });
  const data = await resp.json();
  const text = data.response;
  try {
    return JSON.parse(text);
  } catch {
    console.error("Invalid JSON:", text);
    return null;
  }
}
```

---

## 🔄 UI Integration Flow

1. User clicks **Refactor** button on a todo item.
2. Invoke `refactorTodo(originalTodo)`.
3. Parse and validate returned object.
4. Overwrite the original todo in front-end or backend store.
5. Update UI with new content.

---

## 🔧 Error Handling & Edge Cases

- If parsing fails or API call errors → fallback to original todo.
- Validate returned `id` matches original.
- Handle empty or truncated responses gracefully.
- Prevent rapid repeated calls (debounce click, disable button during request).

---

## ✅ Testing

- Use sample todo:  
  `{ id: 1, title: "buy milk", description: "get milk 2l from store" }`  
- Confirm final output includes polished title and bulleted description, same `id`.

---

## 📋 Summary Table

| Step               | Description                                              |
|--------------------|----------------------------------------------------------|
| API Endpoint       | `POST https://mlvoca.com/api/generate`                   |
| Model              | `deepseek-r1:1.5b`                                        |
| Prompt             | Includes JSON of todo + instructions                     |
| Response Format    | JSON (`format: "json"`)                                  |
| Integration Action | Overwrite todo with parsed response object               |
| Error Handling     | Parse failure, API errors, validation on `id`            |

---

## 🧠 Notes & References

- **No API key required**, public access with no rate limits or registration  
- **DeepSeek‑R1 (1.5 B distilled)** model offers solid POC quality  
- Use `stream: false` for clean JSON replies
****