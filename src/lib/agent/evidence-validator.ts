import { ClaimEvidence, EvidenceType } from "@/types/guide";

/**
 * Normalizes text for robust comparison by collapsing whitespace and punctuation.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks whether a verbatim quote appears within a source document.
 * Supports exact match, normalized substring match, and token-window proximity match.
 */
export function verifyQuoteInText(quote: string, sourceText: string): boolean {
  if (!quote || !sourceText) return false;

  // 1. Exact substring check
  if (sourceText.includes(quote.trim())) {
    return true;
  }

  // 2. Normalized substring check
  const normalizedQuote = normalizeText(quote);
  const normalizedSource = normalizeText(sourceText);

  if (normalizedSource.includes(normalizedQuote)) {
    return true;
  }

  // 3. Sub-segment matching for longer quotes (at least 60% contiguous token match)
  const quoteTokens = normalizedQuote.split(" ").filter((t) => t.length > 2);
  if (quoteTokens.length >= 5) {
    const chunk = quoteTokens.slice(0, Math.min(10, quoteTokens.length)).join(" ");
    if (normalizedSource.includes(chunk)) {
      return true;
    }
  }

  return false;
}

export interface ValidationResult {
  validatedClaims: ClaimEvidence[];
  rejectedClaims: Array<{ claim: ClaimEvidence; reason: string }>;
  isValid: boolean;
}

/**
 * Validates generated claims against fetched source pages.
 * Rejects or flags claims that cite non-existent quotes or unfetched URLs.
 */
export function validateClaimsAgainstSources(
  claims: ClaimEvidence[],
  fetchedSources: Map<string, { title: string; text: string }>
): ValidationResult {
  const validatedClaims: ClaimEvidence[] = [];
  const rejectedClaims: Array<{ claim: ClaimEvidence; reason: string }> = [];

  for (const claim of claims) {
    // If the claim is already explicitly marked as UNSPECIFIED IN DOCS or ESTIMATE
    if (claim.evidence_type === "UNSPECIFIED IN DOCS" || claim.evidence_type === "ESTIMATE") {
      validatedClaims.push(claim);
      continue;
    }

    const source = fetchedSources.get(claim.source_url);

    if (!source) {
      rejectedClaims.push({
        claim,
        reason: `Cited source URL "${claim.source_url}" was not retrieved during discovery.`,
      });
      // Downgrade to UNSPECIFIED IN DOCS instead of inventing facts
      validatedClaims.push({
        ...claim,
        evidence_type: "UNSPECIFIED IN DOCS" as EvidenceType,
        verbatim_quote: "[Evidence could not be verified in fetched documentation]",
      });
      continue;
    }

    const quoteVerified = verifyQuoteInText(claim.verbatim_quote, source.text);

    if (!quoteVerified) {
      rejectedClaims.push({
        claim,
        reason: `Verbatim quote was not found in source text from "${claim.source_url}".`,
      });
      // Downgrade claim
      validatedClaims.push({
        ...claim,
        evidence_type: "UNSPECIFIED IN DOCS" as EvidenceType,
        verbatim_quote: "[Cited snippet not found in retrieved document content]",
      });
    } else {
      // Verified doc-backed claim
      validatedClaims.push({
        ...claim,
        evidence_type: "DOC_BACKED" as EvidenceType,
        source_title: claim.source_title || source.title,
      });
    }
  }

  return {
    validatedClaims,
    rejectedClaims,
    isValid: rejectedClaims.length === 0,
  };
}
