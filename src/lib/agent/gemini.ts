import https from "node:https";
import { Guide, GuideSchema } from "@/types/guide";

export class GeminiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "GeminiError";
  }
}

const FALLBACK_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

function makeHttpsPost(url: string, payload: string, timeoutMs = 75000): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "POST",
        family: 4,
        timeout: timeoutMs,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode || 500, body }));
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new GeminiError(`Gemini API request timed out after ${timeoutMs / 1000} seconds.`));
    });

    req.on("error", (err) => {
      reject(new GeminiError(`Gemini request failed: ${err.message}`));
    });

    req.write(payload);
    req.end();
  });
}

export async function callGeminiStructured<T>(
  prompt: string,
  systemInstruction?: string,
  modelOverride?: string
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError("GEMINI_API_KEY is not configured in environment variables.");
  }

  const requestedModel = modelOverride || process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
  const modelChain = Array.from(new Set([requestedModel, ...FALLBACK_MODELS]));

  const payloadObj: Record<string, unknown> = {
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
    payloadObj.system_instruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const jsonPayload = JSON.stringify(payloadObj);
  let lastError: Error | null = null;

  for (const model of modelChain) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const { status, body } = await makeHttpsPost(endpoint, jsonPayload);

      if (status === 200) {
        const json = JSON.parse(body);
        const candidate = json.candidates?.[0];
        const textPart = candidate?.content?.parts?.[0]?.text;

        if (!textPart) {
          throw new GeminiError("Gemini returned an empty response candidate.");
        }

        try {
          return JSON.parse(textPart) as T;
        } catch (err) {
          throw new GeminiError(`Failed to parse Gemini response as JSON: ${(err as Error).message}`);
        }
      }

      // If model is deprecated (404) or busy (503), try next model in chain
      if (status === 404 || status === 503) {
        console.warn(`Gemini model "${model}" returned HTTP ${status}. Attempting next model...`);
        lastError = new GeminiError(`Gemini model ${model} unavailable (HTTP ${status})`, status);
        continue;
      }

      // For other client or auth errors (e.g., 400, 401, 403), parse message and throw immediately
      let parsedMessage = body;
      try {
        const errJson = JSON.parse(body);
        parsedMessage = errJson.error?.message || body;
      } catch {
        // ignore
      }
      throw new GeminiError(`Gemini API error (HTTP ${status}): ${parsedMessage}`, status);
    } catch (err) {
      const errMsg = (err as Error)?.message || "";
      if (
        (err instanceof GeminiError && (err.statusCode === 404 || err.statusCode === 503)) ||
        errMsg.includes("timed out") ||
        errMsg.includes("network request failed")
      ) {
        console.warn(`Gemini model "${model}" encountered error (${errMsg}). Trying next model in fallback chain...`);
        lastError = err as Error;
        continue;
      }
      throw err;
    }
  }

  throw lastError || new GeminiError("All available Gemini models in fallback chain were exhausted.");
}

export function validateGuideResponse(data: unknown): Guide {
  const result = GuideSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new GeminiError(`Generated guide failed schema validation: ${issues}`);
  }
  return result.data;
}
