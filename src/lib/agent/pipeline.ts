import { Guide, ResearchRun, ResearchStageState } from "@/types/guide";
import { saveGuide, updateResearchRun } from "@/lib/db";
import { searchDocumentation } from "./search";
import { safeFetch } from "@/lib/security/ssrf";
import { extractTextAndLinksFromHtml } from "./html-parser";
import { callGeminiStructured, validateGuideResponse, GeminiError } from "./gemini";
import { validateClaimsAgainstSources } from "./evidence-validator";

function createInitialStages(): ResearchStageState[] {
  return [
    {
      stage: "discover",
      name: "Discovering Documentation",
      status: "pending",
      message: "Identifying official provider domain and developer OAuth documentation...",
    },
    {
      stage: "extract",
      name: "Extracting Requirements",
      status: "pending",
      message: "Fetching documentation pages, scopes, and callback requirements...",
    },
    {
      stage: "investigate",
      name: "Investigating Approval & Readiness",
      status: "pending",
      message: "Analyzing dev vs prod boundaries, review waits, and automatable steps...",
    },
    {
      stage: "validate",
      name: "Validating Evidence",
      status: "pending",
      message: "Deterministically verifying citations and verbatim quotes against sources...",
    },
    {
      stage: "generate",
      name: "Generating Structured Guide",
      status: "pending",
      message: "Compiling verified launch playbook and saving shareable guide...",
    },
  ];
}

export async function runResearchPipeline(
  runId: string,
  appInput: string
): Promise<Guide | null> {
  const stages = createInitialStages();

  const updateStage = async (
    stageIndex: number,
    status: ResearchStageState["status"],
    message: string,
    sourcesFound?: { title: string; url: string }[]
  ) => {
    stages[stageIndex].status = status;
    stages[stageIndex].message = message;
    if (sourcesFound) {
      stages[stageIndex].sources_found = sourcesFound;
    }
    await updateResearchRun(runId, { stages });
  };

  try {
    // ==========================================
    // PHASE 1: DISCOVER
    // ==========================================
    await updateStage(0, "running", `Searching official developer portals for "${appInput}"...`);

    const { results: searchResults, providerUsed } = await searchDocumentation(appInput);

    if (searchResults.length === 0) {
      await updateStage(
        0,
        "failed",
        `Could not locate official developer documentation for "${appInput}". Please provide a direct documentation URL or configure TAVILY_API_KEY.`
      );
      await updateResearchRun(runId, {
        status: "failed",
        error: `No documentation discovered for "${appInput}".`,
      });
      return null;
    }

    const sourcesSummary = searchResults.map((r) => ({ title: r.title, url: r.url }));
    await updateStage(
      0,
      "completed",
      `Discovered ${searchResults.length} relevant documentation sources via ${providerUsed}.`,
      sourcesSummary
    );

    // ==========================================
    // PHASE 2: EXTRACT
    // ==========================================
    await updateStage(1, "running", "Retrieving documentation pages and parsing content...");

    const fetchedSources = new Map<string, { title: string; text: string }>();
    const docUrlsToFetch = searchResults.slice(0, 3).map((r) => r.url);

    for (const url of docUrlsToFetch) {
      try {
        const { text: htmlContent } = await safeFetch(url, { timeoutMs: 10000 });
        const { title, text } = extractTextAndLinksFromHtml(htmlContent, url);
        // Truncate to reasonable token length per page
        const cappedText = text.substring(0, 15000);
        fetchedSources.set(url, { title, text: cappedText });
      } catch (err) {
        console.warn(`Extraction error for ${url}:`, err);
      }
    }

    if (fetchedSources.size === 0) {
      await updateStage(1, "failed", "Failed to retrieve content from discovered documentation pages.");
      await updateResearchRun(runId, {
        status: "failed",
        error: "All documentation page requests failed or were blocked by security rules.",
      });
      return null;
    }

    await updateStage(
      1,
      "completed",
      `Extracted content from ${fetchedSources.size} documentation pages.`
    );

    // ==========================================
    // PHASE 3: INVESTIGATE
    // ==========================================
    await updateStage(2, "running", "Analyzing OAuth architecture, scopes, and verification tiers with Gemini...");

    // Build context for Gemini
    let documentationContext = "";
    for (const [url, doc] of fetchedSources.entries()) {
      documentationContext += `\n\n--- SOURCE URL: ${url} ---\n--- TITLE: ${doc.title} ---\n${doc.text}\n`;
    }

    const systemPrompt = `You are a Principal Integration Engineer and OAuth Architect.
Analyze the provided developer documentation to generate a strict, evidence-backed OAuth Setup and Readiness Guide.

STRICT ACCURACY RULES:
1. Every factual claim in "claims_and_evidence" MUST include a verbatim quote that appears EXACTLY in the provided documentation text.
2. If an exact review timeline, audit fee, or quota is NOT explicitly documented, write "Not specified in official documentation" and set is_documented=false, is_estimate=true.
3. NEVER fabricate fees, review durations, or verification criteria.
4. Distinguish setup steps by responsibility badge:
   - "HUMAN REQUIRED": console logins, business verification, uploading legal docs, manual settings.
   - "AGENT AUTOMATABLE": drafting scope justifications, formatting redirect URIs, generating configuration files, checking endpoint parameters.
   - "HYBRID": preparing demo video scripts, checking prerequisites.
5. In "managed_oauth", analyze whether managed OAuth solutions like Composio support this provider.
6. The output MUST be a valid JSON object matching the Guide schema.`;

    const userPrompt = `Target Application Input: "${appInput}"

Retrieved Official Documentation:
${documentationContext}

Generate the complete JSON guide with the following fields:
- slug: sanitized URL slug (e.g. "notion", "linear")
- provider_name: clean display name (e.g. "Notion")
- category: industry category
- description: concise summary of OAuth integration capabilities
- official_domain: official domain
- documentation_urls: list of source URLs
- last_researched_at: "${new Date().toISOString().split("T")[0]}"
- research_status: "verified" | "partially_verified" | "insufficient_evidence"
- readiness_summary: high level summary of approval readiness
- complexity: "Low" | "Moderate" | "High" | "Very High"
- readiness: { development: {...}, external_testing: {...}, public_distribution: {...}, production: {...} }
- managed_oauth: { available: "yes"|"no"|"unknown", provider: "Composio", what_it_handles: [...], what_you_configure: [...], prototyping_suitability: "...", limitations: [...], sources: [...] }
- custom_oauth: { available: true, prerequisites: [...], setup_steps: [...], branding_and_consent_requirements: [...], verification_checklist: [...], production_checklist: [...] }
- scopes: list of scopes with risk_tier ("standard" | "sensitive" | "restricted" | "unknown"), description, verification_requirements, warnings, and source_ids
- effort_and_timeline: { active_setup: { value, is_estimate, is_documented, details }, external_review: { value, is_estimate, is_documented, details }, audit_cost: { value, is_estimate, is_documented, details } }
- blockers: list of common errors with error_or_symptom, likely_cause, suggested_resolution, and relevant_source_url
- unknowns_and_limitations: list of undocumented aspects or platform caveats
- claims_and_evidence: array of claims, each with claim, evidence_type ("DOC_BACKED" | "PORTAL_OBSERVED" | "ESTIMATE" | "UNSPECIFIED IN DOCS"), source_title, source_url, and verbatim_quote

Return ONLY the raw JSON object.`;

    let rawGuide: unknown;
    try {
      rawGuide = await callGeminiStructured<Guide>(userPrompt, systemPrompt);
    } catch (err) {
      if (err instanceof GeminiError) {
        await updateStage(2, "failed", `Gemini extraction failed: ${err.message}`);
        await updateResearchRun(runId, { status: "failed", error: err.message });
        return null;
      }
      throw err;
    }

    const validatedGuideData = validateGuideResponse(rawGuide);
    await updateStage(2, "completed", "OAuth requirements, readiness tiers, and scopes analyzed.");

    // ==========================================
    // PHASE 4: VALIDATE
    // ==========================================
    await updateStage(3, "running", "Deterministically verifying verbatim quotes against fetched source pages...");

    const validationResult = validateClaimsAgainstSources(
      validatedGuideData.claims_and_evidence,
      fetchedSources
    );

    // Apply validated claims back to guide
    validatedGuideData.claims_and_evidence = validationResult.validatedClaims;

    const rejectedCount = validationResult.rejectedClaims.length;
    const validationMessage =
      rejectedCount === 0
        ? "All claims successfully verified against retrieved documentation text."
        : `Verified claims; ${rejectedCount} unverified claims safely marked as UNSPECIFIED IN DOCS to eliminate hallucination.`;

    await updateStage(3, "completed", validationMessage);

    // ==========================================
    // PHASE 5: GENERATE & PERSIST
    // ==========================================
    await updateStage(4, "running", "Saving verified guide to database and generating shareable URL...");

    // Ensure slug is clean
    const safeSlug =
      validatedGuideData.slug.toLowerCase().replace(/[^a-z0-9-]/g, "") ||
      appInput.toLowerCase().replace(/[^a-z0-9-]/g, "");
    validatedGuideData.slug = safeSlug;
    validatedGuideData.is_seed = false;

    // Persist guide
    await saveGuide(validatedGuideData);

    await updateStage(4, "completed", `Guide published at /guides/${safeSlug}`);

    await updateResearchRun(runId, {
      status: "completed",
      generated_slug: safeSlug,
    });

    return validatedGuideData;
  } catch (err: unknown) {
    const errorMsg = (err as Error).message || "An unexpected error occurred during research.";
    console.error("Research pipeline error:", err);
    await updateResearchRun(runId, {
      status: "failed",
      error: errorMsg,
    });
    return null;
  }
}
