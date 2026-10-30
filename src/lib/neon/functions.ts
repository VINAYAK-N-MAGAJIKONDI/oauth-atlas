export async function callHelloFunction(): Promise<{
  success: boolean;
  message?: string;
  url?: string;
  error?: string;
}> {
  const baseUrl = process.env.NEON_FUNCTION_HELLO_BASE_URL;
  if (!baseUrl) {
    return {
      success: false,
      error: "NEON_FUNCTION_HELLO_BASE_URL is not configured in environment variables.",
    };
  }

  const endpoint = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "User-Agent": "OAuthAtlas/1.0",
      },
    });

    if (!res.ok) {
      return {
        success: false,
        url: endpoint,
        error: `Neon Function returned HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const message = await res.text();
    return {
      success: true,
      url: endpoint,
      message: message.trim(),
    };
  } catch (err: unknown) {
    return {
      success: false,
      url: endpoint,
      error: (err as Error).message,
    };
  }
}
