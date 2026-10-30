import dns from "dns/promises";
import net from "net";

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}

/**
 * Checks whether an IPv4 address belongs to a private, loopback, or link-local range.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IP treated as unsafe
  }

  const [b0, b1] = parts;

  // 127.0.0.0/8 - Loopback
  if (b0 === 127) return true;

  // 0.0.0.0/8 - Broadcast / Local
  if (b0 === 0) return true;

  // 10.0.0.0/8 - Private Class A
  if (b0 === 10) return true;

  // 172.16.0.0/12 - Private Class B (172.16.0.0 to 172.31.255.255)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

  // 192.168.0.0/16 - Private Class C
  if (b0 === 192 && b1 === 168) return true;

  // 169.254.0.0/16 - Link-Local / Cloud Metadata (169.254.169.254)
  if (b0 === 169 && b1 === 254) return true;

  // 100.64.0.0/10 - Carrier-Grade NAT
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

  return false;
}

/**
 * Checks whether an IPv6 address is private, loopback, or link-local.
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // Unique local fc00::/7
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) {
    return true; // Link-local fe80::/10
  }
  return false;
}

/**
 * Validates a URL string against SSRF attack vectors.
 */
export async function validateSafeUrl(urlString: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new SecurityError(`Invalid URL format: "${urlString}"`);
  }

  // Only allow http and https
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SecurityError(`Prohibited protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`);
  }

  // Reject embedded credentials
  if (parsed.username || parsed.password) {
    throw new SecurityError("URLs containing embedded username or password credentials are forbidden.");
  }

  const hostname = parsed.hostname.toLowerCase();

  // Known dangerous hostnames and cloud metadata aliases
  const prohibitedHosts = [
    "localhost",
    "metadata.google.internal",
    "instance-data",
    "metadata.packet.net",
  ];

  if (prohibitedHosts.includes(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new SecurityError(`Forbidden hostname "${hostname}". Local and internal network names are blocked.`);
  }

  // If hostname is directly an IP
  if (net.isIPv4(hostname)) {
    if (isPrivateIPv4(hostname)) {
      throw new SecurityError(`Access to private IPv4 address "${hostname}" is blocked.`);
    }
  } else if (net.isIPv6(hostname)) {
    if (isPrivateIPv6(hostname)) {
      throw new SecurityError(`Access to private IPv6 address "${hostname}" is blocked.`);
    }
  } else {
    // Perform DNS resolution to check resolved IP
    try {
      const resolved = await dns.lookup(hostname, { all: true });
      for (const entry of resolved) {
        if (entry.family === 4 && isPrivateIPv4(entry.address)) {
          throw new SecurityError(`Hostname "${hostname}" resolves to private IP "${entry.address}". Request rejected.`);
        }
        if (entry.family === 6 && isPrivateIPv6(entry.address)) {
          throw new SecurityError(`Hostname "${hostname}" resolves to private IPv6 "${entry.address}". Request rejected.`);
        }
      }
    } catch (err: unknown) {
      if (err instanceof SecurityError) throw err;
      throw new SecurityError(`Failed to resolve DNS for hostname "${hostname}": ${(err as Error).message}`);
    }
  }

  return parsed;
}

/**
 * Safe fetch wrapper that enforces timeouts, size limits, and safe redirects.
 */
export async function safeFetch(
  urlString: string,
  options: {
    timeoutMs?: number;
    maxBytes?: number;
    maxRedirects?: number;
    headers?: Record<string, string>;
  } = {}
): Promise<{ text: string; status: number; url: string; headers: Headers }> {
  const {
    timeoutMs = 8000,
    maxBytes = 2 * 1024 * 1024, // 2MB
    maxRedirects = 5,
    headers = {},
  } = options;

  let currentUrl = urlString;
  let redirectsRemaining = maxRedirects;

  while (true) {
    const validated = await validateSafeUrl(currentUrl);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(validated.toString(), {
        method: "GET",
        headers: {
          "User-Agent": "OAuthAtlas-ResearchBot/1.0 (+https://oauthatlas.dev)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          ...headers,
        },
        signal: controller.signal,
        redirect: "manual", // Manually validate every redirect hop
      });

      clearTimeout(timer);

      // Handle redirect status codes manually to enforce SSRF validation at each hop
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get("location");
        if (!location) {
          throw new SecurityError("Redirect response received with no Location header.");
        }

        if (redirectsRemaining <= 0) {
          throw new SecurityError("Exceeded maximum redirect limit (5 hops).");
        }

        redirectsRemaining--;
        // Resolve relative redirects
        const nextUrl = new URL(location, currentUrl).toString();
        currentUrl = nextUrl;
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      // Check content-length header if present
      const contentLength = res.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > maxBytes) {
        throw new SecurityError(`Content length ${contentLength} bytes exceeds limit of ${maxBytes} bytes.`);
      }

      // Read text with size cap
      const rawText = await res.text();
      if (rawText.length > maxBytes) {
        return {
          text: rawText.substring(0, maxBytes),
          status: res.status,
          url: currentUrl,
          headers: res.headers,
        };
      }

      return {
        text: rawText,
        status: res.status,
        url: currentUrl,
        headers: res.headers,
      };
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof SecurityError) throw err;
      if ((err as Error).name === "AbortError") {
        throw new Error(`Request timed out after ${timeoutMs}ms.`);
      }
      throw err;
    }
  }
}
