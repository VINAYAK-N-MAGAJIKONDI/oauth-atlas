import { safeFetch } from "@/lib/security/ssrf";

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

// Known developer portals for common developer tools when search API is not provided
const KNOWN_DEV_PORTALS: Record<string, { domain: string; docUrl: string; oauthUrl: string }> = {
  notion: {
    domain: "developers.notion.com",
    docUrl: "https://developers.notion.com/docs/authorization",
    oauthUrl: "https://www.notion.so/my-integrations",
  },
  linear: {
    domain: "developers.linear.app",
    docUrl: "https://developers.linear.app/docs/oauth/authentication",
    oauthUrl: "https://linear.app/settings/api",
  },
  hubspot: {
    domain: "developers.hubspot.com",
    docUrl: "https://developers.hubspot.com/docs/api/working-with-oauth",
    oauthUrl: "https://app.hubspot.com/developer",
  },
  spotify: {
    domain: "developer.spotify.com",
    docUrl: "https://developer.spotify.com/documentation/web-api/tutorials/code-flow",
    oauthUrl: "https://developer.spotify.com/dashboard",
  },
  discord: {
    domain: "discord.com/developers",
    docUrl: "https://discord.com/developers/docs/topics/oauth2",
    oauthUrl: "https://discord.com/developers/applications",
  },
  figma: {
    domain: "figma.com/developers",
    docUrl: "https://www.figma.com/developers/api#oauth2",
    oauthUrl: "https://www.figma.com/developers/apps",
  },
};

/**
 * Searches for official developer OAuth documentation for a target application.
 */
export async function searchDocumentation(
  appOrUrl: string
): Promise<{ results: SearchResult[]; providerUsed: string }> {
  const trimmed = appOrUrl.trim();

  // 1. Direct URL provided
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return {
      results: [
        {
          title: "User-Provided Documentation URL",
          url: trimmed,
          snippet: "Direct documentation target provided by user.",
        },
      ],
      providerUsed: "direct_url",
    };
  }

  // 2. Tavily API Search if key is configured
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  if (tavilyApiKey) {
    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: `${trimmed} developer oauth 2.0 documentation scopes app review`,
          search_depth: "basic",
          max_results: 5,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          const results: SearchResult[] = data.results.map((r: { title: string; url: string; content?: string }) => ({
            title: r.title,
            url: r.url,
            snippet: r.content,
          }));
          return { results, providerUsed: "tavily" };
        }
      }
    } catch (err) {
      console.warn("Tavily search failed, falling back:", err);
    }
  }

  // 3. Known developer portal fallback
  const lookupKey = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (KNOWN_DEV_PORTALS[lookupKey]) {
    const known = KNOWN_DEV_PORTALS[lookupKey];
    return {
      results: [
        {
          title: `${trimmed} Official Authorization Documentation`,
          url: known.docUrl,
          snippet: `Official OAuth documentation for ${trimmed}`,
        },
      ],
      providerUsed: "known_directory",
    };
  }

  // 4. DuckDuckGo HTML fallback search for discovery
  try {
    const ddgQuery = encodeURIComponent(`${trimmed} official developer oauth documentation`);
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${ddgQuery}`;
    const { text } = await safeFetch(ddgUrl, { timeoutMs: 6000 });

    const linkRegex = /<a class="result__url" href="([^"]+)">/g;
    const titleRegex = /<a class="result__snippet[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g;
    
    const results: SearchResult[] = [];
    let match: RegExpExecArray | null;

    // Extract links
    const urls: string[] = [];
    while ((match = linkRegex.exec(text)) !== null && urls.length < 5) {
      const raw = match[1].trim();
      // DuckDuckGo redirect decode
      if (raw.includes("uddg=")) {
        const target = decodeURIComponent(raw.split("uddg=")[1].split("&")[0]);
        urls.push(target);
      } else if (raw.startsWith("http")) {
        urls.push(raw);
      }
    }

    for (const url of urls) {
      results.push({
        title: `${trimmed} Developer Resource`,
        url,
        snippet: "Discovered via public web search.",
      });
    }

    if (results.length > 0) {
      return { results, providerUsed: "duckduckgo_discovery" };
    }
  } catch (err) {
    console.warn("Public web discovery fallback encountered error:", err);
  }

  // 5. If all fail, return empty list with indication
  return {
    results: [],
    providerUsed: "none_available",
  };
}
