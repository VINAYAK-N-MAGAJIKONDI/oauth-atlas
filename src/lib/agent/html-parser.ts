/**
 * Lightweight HTML-to-clean-text parser for developer documentation extraction.
 */
export function extractTextAndLinksFromHtml(
  html: string,
  baseUrl: string
): { title: string; text: string; links: string[] } {
  // Extract Title
  let title = "";
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // Remove noise elements: scripts, styles, svgs, header/footer/nav
  let cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  // Extract relevant doc links before stripping tags
  const links: string[] = [];
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(cleanHtml)) !== null) {
    const rawHref = match[1];
    const linkText = match[2].toLowerCase();

    // Check if link seems relevant to auth / oauth / permissions / scopes / api
    if (
      linkText.includes("oauth") ||
      linkText.includes("auth") ||
      linkText.includes("permission") ||
      linkText.includes("scope") ||
      linkText.includes("app") ||
      rawHref.includes("oauth") ||
      rawHref.includes("auth") ||
      rawHref.includes("developer")
    ) {
      try {
        const absoluteUrl = new URL(rawHref, baseUrl).toString();
        // Skip anchors or javascript:
        if (absoluteUrl.startsWith("http://") || absoluteUrl.startsWith("https://")) {
          // Exclude self-references with only hash diffs
          const normalized = absoluteUrl.split("#")[0];
          if (!links.includes(normalized) && links.length < 15) {
            links.push(normalized);
          }
        }
      } catch {
        // Ignore invalid URLs
      }
    }
  }

  // Convert line breaks and headers
  cleanHtml = cleanHtml
    .replace(/<\/(h[1-6]|p|div|li|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " "); // Strip remaining tags

  // Unescape standard HTML entities
  const decodedText = cleanHtml
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Collapse consecutive whitespace and empty lines
  const text = decodedText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  return {
    title: title || "Documentation Page",
    text,
    links,
  };
}
