export async function verifyNeonAuthService(): Promise<{
  configured: boolean;
  baseUrl?: string;
  jwksUrl?: string;
  jwksAccessible: boolean;
  keysCount?: number;
  error?: string;
}> {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;

  if (!baseUrl || !jwksUrl) {
    return {
      configured: false,
      jwksAccessible: false,
      error: "Neon Auth environment variables (NEON_AUTH_BASE_URL, NEON_AUTH_JWKS_URL) not set.",
    };
  }

  try {
    const res = await fetch(jwksUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return {
        configured: true,
        baseUrl,
        jwksUrl,
        jwksAccessible: false,
        error: `Neon Auth JWKS endpoint returned HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    const keysCount = Array.isArray(data.keys) ? data.keys.length : 0;

    return {
      configured: true,
      baseUrl,
      jwksUrl,
      jwksAccessible: true,
      keysCount,
    };
  } catch (err: unknown) {
    return {
      configured: true,
      baseUrl,
      jwksUrl,
      jwksAccessible: false,
      error: (err as Error).message,
    };
  }
}
