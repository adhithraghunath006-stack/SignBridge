const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function fetchJson(endpoint, options = {}) {
  try {
    const url = API_BASE + endpoint;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.error || ("HTTP " + res.status + ": " + res.statusText));
    }
    return await res.json();
  } catch (err) {
    console.warn("[API] Request to " + endpoint + " failed:", err.message);
    throw err;
  }
}

export const api = {
  getHealth: () => fetchJson("/health"),
  
  // Conversation
  getState: () => fetchJson("/conversation/state"),
  startSession: () => fetchJson("/conversation/start", { method: "POST" }),
  sendInput: (payload) => fetchJson("/conversation/input", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  interrupt: (reason = "manual") => fetchJson("/conversation/interrupt", {
    method: "POST",
    body: JSON.stringify({ reason })
  }),
  completeSpeaking: (responseId) => fetchJson("/conversation/complete", {
    method: "POST",
    body: JSON.stringify({ response_id: responseId })
  }),
  getTelemetry: () => fetchJson("/conversation/telemetry"),

  // Rime
  synthesize: (text, speaker = "astra", modelId = "coda") => fetchJson("/rime/synthesize", {
    method: "POST",
    body: JSON.stringify({ text, speaker, model_id: modelId })
  }),
  getRimeHealth: () => fetchJson("/rime/health"),

  // Sign
  getVocabulary: () => fetchJson("/sign/vocabulary"),
  predictSign: (token, confidence) => fetchJson("/sign/predict", {
    method: "POST",
    body: JSON.stringify({ token, confidence })
  }),

  // Speech
  normalizeSpeech: (text) => fetchJson("/speech/transcribe", {
    method: "POST",
    body: JSON.stringify({ text })
  }),

  // Evaluation
  runEvaluation: (numRuns = 20) => fetchJson("/evaluation/run", {
    method: "POST",
    body: JSON.stringify({ num_runs: numRuns })
  }),
  getEvaluationResults: () => fetchJson("/evaluation/results"),
};