/**
 * aiProvider.ts
 * Multi-provider AI for rant decomposition + audio transcription.
 * Priority: Gemini (primary) -> OpenRouter -> NVIDIA NIM -> local regex
 *
 * Keys are read fresh from SQLite on every call.
 */

import { getDb } from "../App";
import { parseRantTranscript, type ParsedRantResult, type ParsedItem } from "./rantParser";
import type { DomainKey } from "../App";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AIProvider = "gemini" | "openrouter" | "nvidia" | "local";

export interface AIParseResult extends ParsedRantResult {
  provider: AIProvider;
}

// ---------------------------------------------------------------------------
// Shared prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a personal life-management assistant inside The Mainframe app.

Parse the raw voice rant transcript and extract atomic actionable items, classifying each into exactly one of these 9 domains:

- certifications   (courses, exams, degrees, accreditations)
- build_ideas      (software builds, tools, apps, prototypes)
- acquisitions     (things to buy: hardware, gear, software)
- goals            (milestones, targets, financial goals, health)
- ventures         (business ideas, startups, revenue streams)
- writing          (essays, research papers, blog posts)
- skills           (things to master, practice, learn)
- experiences      (bucket-list travel, adventures, challenges)
- journal          (reflections, feelings, observations)

Return a JSON array only - no explanation, no markdown fences:
[
  {
    "domain": "<one of the 9 keys>",
    "title": "<concise title, max 60 chars>",
    "notes": "<verbatim clause from transcript>",
    "action_trigger": "<verbatim when/where/how plan if present, else null>",
    "is_software_build": false,
    "confidence": 0.9,
    "tags": ["<domain-slug>"]
  }
]

Rules:
1. Preserve verbatim action_trigger text.
2. Never invent content not in transcript.
3. Split compound sentences into separate atomic items.
4. Default domain = "journal" if nothing fits.
5. Return ONLY the JSON array.`;

const USER_PROMPT = (t: string) => `Parse this voice rant:\n\n${t}`;

// ---------------------------------------------------------------------------
// Key loader
// ---------------------------------------------------------------------------

interface Keys {
  geminiKey: string | null;
  openrouterKey: string | null;
  nvidiaKey: string | null;
  groqKey: string | null;
}

async function loadKeys(): Promise<Keys> {
  try {
    const db = await getDb();
    const rows = await db.select<{ key: string; value: string }[]>(
      `SELECT key, value FROM app_settings WHERE key IN ('gemini_api_key','openrouter_api_key','nvidia_api_key','groq_api_key')`
    );
    const map: Record<string, string> = {};
    for (const r of rows) if (r.value?.trim()) map[r.key] = r.value.trim();
    return {
      geminiKey: map["gemini_api_key"] ?? null,
      openrouterKey: map["openrouter_api_key"] ?? null,
      nvidiaKey: map["nvidia_api_key"] ?? null,
      groqKey: map["groq_api_key"] ?? null,
    };
  } catch {
    return { geminiKey: null, openrouterKey: null, nvidiaKey: null, groqKey: null };
  }
}

// ---------------------------------------------------------------------------
// Response parser (shared)
// ---------------------------------------------------------------------------

const VALID_DOMAINS = new Set<DomainKey>([
  "certifications","build_ideas","acquisitions","goals",
  "ventures","writing","skills","experiences","journal",
]);

function parseAIResponse(raw: string): ParsedItem[] {
  const match = raw.match(/\[[\s\S]*\]/);
  const jsonStr = match ? match[0] : raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  let parsed: unknown;
  try { parsed = JSON.parse(jsonStr); }
  catch { throw new Error(`Not valid JSON: ${jsonStr.slice(0, 120)}`); }
  if (!Array.isArray(parsed)) throw new Error("Response was not an array");
  return (parsed as Record<string, unknown>[]).map((item, idx) => {
    const domain = VALID_DOMAINS.has(item.domain as DomainKey) ? (item.domain as DomainKey) : "journal";
    const result: ParsedItem = {
      domain,
      title: String(item.title ?? `Item ${idx + 1}`).slice(0, 80),
      notes: item.notes ? String(item.notes) : undefined,
      action_trigger: item.action_trigger ? String(item.action_trigger) : undefined,
      is_software_build: Boolean(item.is_software_build),
      confidence: typeof item.confidence === "number" ? item.confidence : 0.85,
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : [domain.replace("_", "-")],
    };
    return result;
  });
}

// ---------------------------------------------------------------------------
// Provider: Gemini (text parsing)
// ---------------------------------------------------------------------------

const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"];

async function callGemini(transcript: string, apiKey: string): Promise<ParsedItem[]> {
  let lastError: Error | null = null;
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${USER_PROMPT(transcript)}` }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        if (resp.status === 404 || resp.status === 400) {
          lastError = new Error(`Gemini ${model} ${resp.status}: ${errText}`);
          continue;
        }
        throw new Error(`Gemini ${resp.status}: ${errText}`);
      }
      const data = await resp.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
      return parseAIResponse(raw);
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError.message.includes("404") || lastError.message.includes("not found")) {
        continue;
      }
      throw lastError;
    }
  }
  throw lastError ?? new Error("All Gemini models failed");
}

// ---------------------------------------------------------------------------
// Provider: Gemini (audio transcription)
// ---------------------------------------------------------------------------

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function transcribeWithGemini(audioBlob: Blob, apiKey: string): Promise<string | null> {
  try {
    const base64 = await blobToBase64(audioBlob);
    const mimeType = audioBlob.type || "audio/webm";

    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Transcribe the following audio exactly as spoken. Return only the verbatim transcription, no commentary." },
                { inlineData: { mimeType, data: base64 } },
              ],
            }],
            generationConfig: { temperature: 0.0, maxOutputTokens: 2048 },
          }),
        });
        if (!resp.ok) {
          const errText = await resp.text();
          console.warn(`Gemini transcription with ${model} failed (${resp.status}):`, errText);
          if (resp.status === 404 || resp.status === 400) {
            continue;
          }
          return null;
        }
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      } catch (err) {
        console.warn(`Gemini transcription error with ${model}:`, err);
        continue;
      }
    }
    return null;
  } catch (err) {
    console.error("Gemini transcription failed:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Provider: OpenRouter (audio transcription)
// ---------------------------------------------------------------------------

export async function transcribeWithOpenRouter(audioBlob: Blob, apiKey: string): Promise<string | null> {
  try {
    const base64 = await blobToBase64(audioBlob);
    const mime = audioBlob.type || "audio/webm";
    const format = mime.includes("mp4") || mime.includes("m4a") ? "mp4" : mime.includes("wav") ? "wav" : mime.includes("ogg") ? "ogg" : "webm";

    // 1. Dedicated audio transcriptions endpoint
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://github.com/karefined-eng/the-mainframe",
          "X-Title": "The Mainframe",
        },
        body: JSON.stringify({
          model: "openai/whisper-large-v3",
          input_audio: {
            data: base64,
            format,
          },
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data?.text?.trim()) return data.text.trim();
      } else {
        console.warn("OpenRouter /audio/transcriptions failed:", resp.status, await resp.text());
      }
    } catch (e) {
      console.warn("OpenRouter STT request error:", e);
    }

    // 2. Multimodal chat completions with input_audio
    try {
      const chatResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://github.com/karefined-eng/the-mainframe",
          "X-Title": "The Mainframe",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          temperature: 0.0,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Transcribe the following audio verbatim. Return only the transcription, no commentary." },
                {
                  type: "input_audio",
                  input_audio: {
                    data: base64,
                    format,
                  },
                },
              ],
            },
          ],
        }),
      });
      if (chatResp.ok) {
        const chatData = await chatResp.json();
        const text = chatData.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch (e) {
      console.warn("OpenRouter chat audio transcription error:", e);
    }
  } catch (err) {
    console.error("OpenRouter audio transcription failed:", err);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Provider: Groq (audio transcription fallback)
// ---------------------------------------------------------------------------

export async function transcribeWithGroq(audioBlob: Blob, apiKey: string): Promise<string | null> {
  try {
    const mime = audioBlob.type || "audio/webm";
    const ext = mime.includes("mp4") || mime.includes("m4a") ? "m4a" : mime.includes("wav") ? "wav" : mime.includes("ogg") ? "ogg" : "webm";
    const formData = new FormData();
    const file = new File([audioBlob], `audio.${ext}`, { type: mime });
    formData.append("file", file);
    formData.append("model", "whisper-large-v3");
    formData.append("response_format", "json");

    const resp = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });
    if (resp.ok) {
      const data = await resp.json();
      return data?.text?.trim() ?? null;
    }
  } catch (err) {
    console.warn("Groq transcription error:", err);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Provider: OpenRouter (text parsing)
// ---------------------------------------------------------------------------

const OPENROUTER_MODELS = [
  "google/gemini-2.0-flash-001",
  "google/gemini-flash-1.5",
  "meta-llama/llama-3.3-70b-instruct",
];

async function callOpenRouter(transcript: string, apiKey: string): Promise<ParsedItem[]> {
  let lastError: Error | null = null;
  for (const model of OPENROUTER_MODELS) {
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://github.com/karefined-eng/the-mainframe",
          "X-Title": "The Mainframe",
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 2048,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: USER_PROMPT(transcript) },
          ],
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        if (resp.status === 404 || resp.status === 400) {
          lastError = new Error(`OpenRouter ${model} ${resp.status}: ${errText}`);
          continue;
        }
        throw new Error(`OpenRouter ${resp.status}: ${errText}`);
      }
      const data = await resp.json();
      const raw = data.choices?.[0]?.message?.content ?? "[]";
      return parseAIResponse(raw);
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }
  throw lastError ?? new Error("All OpenRouter models failed");
}

// ---------------------------------------------------------------------------
// Provider: NVIDIA NIM (text parsing)
// ---------------------------------------------------------------------------

async function callNvidia(transcript: string, apiKey: string): Promise<ParsedItem[]> {
  const resp = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta/llama-3.3-70b-instruct",
      temperature: 0.2,
      max_tokens: 2048,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT(transcript) },
      ],
    }),
  });
  if (!resp.ok) throw new Error(`NVIDIA ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const raw = data.choices?.[0]?.message?.content ?? "[]";
  return parseAIResponse(raw);
}

// ---------------------------------------------------------------------------
// Main exports
// ---------------------------------------------------------------------------

/**
 * Transcribe audio using available providers.
 * Waterfall: Gemini -> OpenRouter -> Groq.
 * Returns null if no keys configured or all providers fail.
 */
export async function transcribeAudio(
  audioBlob: Blob,
  onStatus?: (msg: string) => void
): Promise<string | null> {
  const { geminiKey, openrouterKey, groqKey } = await loadKeys();
  if (!geminiKey && !openrouterKey && !groqKey) {
    onStatus?.("No API key configured — add a Gemini or OpenRouter key in Settings.");
    return null;
  }

  // 1. Primary: Gemini
  if (geminiKey) {
    onStatus?.("Transcribing with Gemini...");
    const text = await transcribeWithGemini(audioBlob, geminiKey);
    if (text) {
      onStatus?.("Transcription complete. Review then sort into domains.");
      return text;
    }
    console.warn("[aiProvider] Gemini transcription failed, checking fallbacks...");
  }

  // 2. Secondary fallback: OpenRouter
  if (openrouterKey) {
    onStatus?.(geminiKey ? "Gemini failed — falling back to OpenRouter..." : "Transcribing with OpenRouter...");
    const text = await transcribeWithOpenRouter(audioBlob, openrouterKey);
    if (text) {
      onStatus?.("Transcription complete via OpenRouter. Review then sort into domains.");
      return text;
    }
    console.warn("[aiProvider] OpenRouter transcription failed...");
  }

  // 3. Tertiary fallback: Groq (if key present in DB)
  if (groqKey) {
    onStatus?.("Falling back to Groq Whisper...");
    const text = await transcribeWithGroq(audioBlob, groqKey);
    if (text) {
      onStatus?.("Transcription complete via Groq. Review then sort into domains.");
      return text;
    }
  }

  onStatus?.("Transcription failed across all providers — type or paste your rant below.");
  return null;
}

/**
 * Parse transcript text into domain items.
 * Waterfall: Gemini -> OpenRouter -> NVIDIA -> local regex.
 * Never throws.
 */
export async function parseRantWithAI(
  transcript: string,
  onStatusChange?: (msg: string) => void
): Promise<AIParseResult> {
  const { geminiKey, openrouterKey, nvidiaKey } = await loadKeys();

  // Gemini
  if (geminiKey) {
    onStatusChange?.("Analyzing with Gemini...");
    try {
      const items = await callGemini(transcript, geminiKey);
      if (items.length > 0) return { rawTranscript: transcript, items, provider: "gemini" };
    } catch (err) {
      console.warn("[aiProvider] Gemini failed:", err);
      onStatusChange?.("Gemini unavailable, trying OpenRouter...");
    }
  }

  // OpenRouter
  if (openrouterKey) {
    onStatusChange?.(geminiKey ? "Falling back to OpenRouter..." : "Analyzing with OpenRouter...");
    try {
      const items = await callOpenRouter(transcript, openrouterKey);
      if (items.length > 0) return { rawTranscript: transcript, items, provider: "openrouter" };
    } catch (err) {
      console.warn("[aiProvider] OpenRouter failed:", err);
      onStatusChange?.("OpenRouter unavailable, trying NVIDIA...");
    }
  }

  // NVIDIA NIM
  if (nvidiaKey) {
    onStatusChange?.(nvidiaKey ? "Falling back to NVIDIA..." : "Analyzing with NVIDIA...");
    try {
      const items = await callNvidia(transcript, nvidiaKey);
      if (items.length > 0) return { rawTranscript: transcript, items, provider: "nvidia" };
    } catch (err) {
      console.warn("[aiProvider] NVIDIA failed:", err);
      onStatusChange?.("All AI providers unavailable, using local parser...");
    }
  }

  // Local fallback
  const hasAny = geminiKey || openrouterKey || nvidiaKey;
  onStatusChange?.(hasAny ? "Using local parser as fallback..." : "Sorting into domains (local mode)...");
  const local = parseRantTranscript(transcript);
  return { ...local, provider: "local" };
}
