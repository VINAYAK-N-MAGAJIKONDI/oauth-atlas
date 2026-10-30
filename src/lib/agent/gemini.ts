import { Guide, GuideSchema } from "@/types/guide";

export class GeminiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "GeminiError";
  }
}

const DEFAULT_MODEL = "gemini-2.5-flash";

export async function callGeminiStructured<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError("GEMINI_API_KEY is not configured in environment variables.");
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.1,
    },
  };

  if (systemInstruction) {
    body.system_instruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000); // 45s limit

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      let parsedMessage = errText;
      try {
        const json = JSON.parse(errText);
        parsedMessage = json.error?.message || errText;
      } catch {
        // ignore
      }
      throw new GeminiError(`Gemini API error (HTTP ${res.status}): ${parsedMessage}`, res.status);
    }

    const json = await res.json();
    const candidate = json.candidates?.[0];
    const textPart = candidate?.content?.parts?.[0]?.text;

    if (!textPart) {
      throw new GeminiError("Gemini returned an empty response candidate.");
    }

    try {
      const parsed = JSON.parse(textPart);
      return parsed as T;
    } catch (err) {
      throw new GeminiError(`Failed to parse Gemini response as JSON: ${(err as Error).message}`);
    }
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof GeminiError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new GeminiError("Gemini API request timed out after 45 seconds.");
    }
    throw new GeminiError(`Gemini request failed: ${(err as Error).message}`);
  }
}

export function validateGuideResponse(data: unknown): Guide {
  const result = GuideSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new GeminiError(`Generated guide failed schema validation: ${issues}`);
  }
  return result.data;
}
