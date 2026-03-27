// ollama.js — local AI client for Ollama running on localhost
// Talks to http://localhost:11434 — no API key needed

const OLLAMA_BASE = "http://localhost:11434";

export async function chat(messages, { model = "qwen2.5:7b", temperature = 0.2 } = {}) {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      format: "json",           // force JSON output — critical for agent loop
      options: {
        temperature,
        num_predict: 1024,
        stop: ["```"],           // stop if model tries to wrap in markdown
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const raw = data.message?.content ?? "";

  // Safely parse JSON — strip any accidental markdown fences
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Model returned invalid JSON:\n${raw}`);
  }
}

export async function generate(prompt, { model = "qwen2.5:7b", temperature = 0.3 } = {}) {
  // Plain text generation — used for ticket writing (not JSON)
  const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { temperature, num_predict: 2048 },
    }),
  });

  if (!res.ok) throw new Error(`Ollama generate error ${res.status}`);
  const data = await res.json();
  return data.response ?? "";
}

export async function isRunning() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listModels() {
  const res = await fetch(`${OLLAMA_BASE}/api/tags`);
  const data = await res.json();
  return data.models?.map((m) => m.name) ?? [];
}