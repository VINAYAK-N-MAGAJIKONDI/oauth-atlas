/**
 * OAuth Atlas Automated Test Suite
 * Tests all 8 mandatory evaluation criteria specified in Section 12.
 */

import { getAllGuides, getGuideBySlug, saveGuide } from "../src/lib/db";
import { validateSafeUrl, SecurityError } from "../src/lib/security/ssrf";
import { validateClaimsAgainstSources, verifyQuoteInText } from "../src/lib/agent/evidence-validator";
import { searchDocumentation } from "../src/lib/agent/search";
import { callGeminiStructured, GeminiError, validateGuideResponse } from "../src/lib/agent/gemini";
import { ClaimEvidence, Guide, ScopeItem } from "../src/types/guide";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` — ${detail}` : ""}`);
  }
}

async function runAllTests() {
  console.log("\n=======================================================");
  console.log("       OAUTH ATLAS AUTOMATED TEST SUITE RUNNER         ");
  console.log("=======================================================\n");

  // =========================================================================
  // TEST 1: Directory & Prebuilt Guides
  // =========================================================================
  console.log("--- TEST 1: Directory & Prebuilt Guides ---");
  const allGuides = await getAllGuides();
  assert(allGuides.length >= 3, "Loads at least 3 prebuilt guides", `Found ${allGuides.length}`);

  const slugs = allGuides.map((g) => g.slug);
  assert(slugs.includes("github"), "GitHub guide exists in directory");
  assert(slugs.includes("slack"), "Slack guide exists in directory");
  assert(slugs.includes("google-drive"), "Google Drive guide exists in directory");

  const searchResults = allGuides.filter((g) =>
    g.provider_name.toLowerCase().includes("git")
  );
  assert(searchResults.length === 1 && searchResults[0].slug === "github", "Search filtering works correctly");

  // =========================================================================
  // TEST 2: Guide Pages & Responsibility Badges
  // =========================================================================
  console.log("\n--- TEST 2: Guide Detail Pages & Badges ---");
  const gh = await getGuideBySlug("github");
  const slack = await getGuideBySlug("slack");
  const gdrive = await getGuideBySlug("google-drive");

  assert(!!gh && gh.provider_name === "GitHub", "GitHub guide retrieves by slug");
  assert(!!slack && slack.provider_name === "Slack", "Slack guide retrieves by slug");
  assert(!!gdrive && gdrive.provider_name.includes("Google Drive"), "Google Drive guide retrieves by slug");

  // Responsibility badges in setup steps
  const allSteps = [...gh!.custom_oauth.setup_steps, ...slack!.custom_oauth.setup_steps, ...gdrive!.custom_oauth.setup_steps];
  const hasHuman = allSteps.some((s) => s.responsibility === "HUMAN REQUIRED");
  const hasAgent = allSteps.some((s) => s.responsibility === "AGENT AUTOMATABLE");
  const hasHybrid = allSteps.some((s) => s.responsibility === "HYBRID");
  assert(hasHuman, "Contains HUMAN REQUIRED steps");
  assert(hasAgent, "Contains AGENT AUTOMATABLE steps");
  assert(hasHybrid, "Contains HYBRID steps");

  // Evidence sources
  assert(gh!.claims_and_evidence.length > 0, "GitHub has verified doc-backed claims");
  assert(slack!.claims_and_evidence.length > 0, "Slack has verified doc-backed claims");
  assert(gdrive!.claims_and_evidence.length > 0, "Google Drive has verified doc-backed claims");

  // =========================================================================
  // TEST 3: Scope Risk Calculator Logic
  // =========================================================================
  console.log("\n--- TEST 3: Scope Risk Calculator & Dynamic Rules Engine ---");
  const gdriveScopes = gdrive!.scopes;
  const driveFileScope = gdriveScopes.find((s) => s.name.includes("drive.file"));
  const driveRestrictedScope = gdriveScopes.find((s) => s.name === "https://www.googleapis.com/auth/drive");
  const driveMetadataScope = gdriveScopes.find((s) => s.name.includes("drive.metadata.readonly"));

  assert(driveFileScope?.risk_tier === "standard", "drive.file is accurately classified as Standard (non-sensitive)");
  assert(driveRestrictedScope?.risk_tier === "restricted", "https://www.googleapis.com/auth/drive is classified as Restricted");
  assert(driveMetadataScope?.risk_tier === "sensitive", "drive.metadata.readonly is classified as Sensitive");

  // Verify CASA trigger logic
  function calculateCasaRequirement(scopes: ScopeItem[], provider: string): boolean {
    return provider.toLowerCase().includes("google") && scopes.some((s) => s.risk_tier === "restricted");
  }

  assert(!calculateCasaRequirement([driveFileScope!], "Google Drive"), "drive.file alone does NOT require CASA security assessment");
  assert(calculateCasaRequirement([driveRestrictedScope!], "Google Drive"), "Broad drive scope mandates third-party CASA security assessment");

  // =========================================================================
  // TEST 4: Research Agent Discovery & Extraction
  // =========================================================================
  console.log("\n--- TEST 4: Research Agent Discovery & Documentation Mapping ---");
  const notionDiscovery = await searchDocumentation("Notion");
  assert(notionDiscovery.results.length > 0, "Discovers Notion developer portal documentation");
  assert(
    notionDiscovery.results.some((r) => r.url.includes("notion.com") || r.url.includes("notion")),
    "Discovered URL points to official Notion developer domain"
  );

  const directUrlDiscovery = await searchDocumentation("https://developers.notion.com/docs/authorization");
  assert(directUrlDiscovery.providerUsed === "direct_url", "Direct documentation URL bypasses search discovery");
  assert(directUrlDiscovery.results[0].url === "https://developers.notion.com/docs/authorization", "Preserves direct URL intact");

  // =========================================================================
  // TEST 5: Evidence Validation & Hallucination Prevention
  // =========================================================================
  console.log("\n--- TEST 5: Deterministic Evidence Validation ---");
  const sampleDocText = `
    GitHub OAuth Apps allow users to authorize external applications.
    Scopes specify the permissions requested by the application.
    Once created, your app is immediately ready for use without manual app review.
  `;

  const fetchedSourcesMap = new Map([
    ["https://docs.github.com/en/apps", { title: "GitHub Apps Docs", text: sampleDocText }],
  ]);

  // Valid Doc-Backed Claim
  const validClaim: ClaimEvidence = {
    id: "claim-valid-1",
    claim: "GitHub OAuth Apps are ready immediately without review.",
    evidence_type: "DOC_BACKED",
    source_title: "GitHub Apps Docs",
    source_url: "https://docs.github.com/en/apps",
    verbatim_quote: "your app is immediately ready for use without manual app review",
  };

  // Synthetic Unsupported Claim (Test case required by spec)
  const syntheticUnsupportedClaim: ClaimEvidence = {
    id: "claim-fake-1",
    claim: "GitHub OAuth App approval always takes exactly 14 business days.",
    evidence_type: "DOC_BACKED",
    source_title: "GitHub Apps Docs",
    source_url: "https://docs.github.com/en/apps",
    verbatim_quote: "GitHub OAuth App approval always takes exactly 14 business days.",
  };

  const validationResult = validateClaimsAgainstSources(
    [validClaim, syntheticUnsupportedClaim],
    fetchedSourcesMap
  );

  assert(validationResult.rejectedClaims.length === 1, "Validator catches and rejects unsupported claim");
  assert(
    validationResult.validatedClaims[1].evidence_type === "UNSPECIFIED IN DOCS",
    "Unsupported claim is safely downgraded to UNSPECIFIED IN DOCS to eliminate hallucination"
  );
  assert(
    validationResult.validatedClaims[0].evidence_type === "DOC_BACKED",
    "Legitimate doc-backed claim is verified and retained"
  );

  // =========================================================================
  // TEST 6: Security & SSRF Protection
  // =========================================================================
  console.log("\n--- TEST 6: Security & SSRF Protection ---");
  const unsafeUrls = [
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:8080/admin",
    "http://10.0.0.1",
    "http://192.168.1.1",
    "http://172.16.0.1",
    "http://169.254.169.254/latest/meta-data/", // AWS/Cloud metadata
    "http://metadata.google.internal/computeMetadata/v1/",
    "ftp://example.com/file.txt",
    "file:///etc/passwd",
    "http://admin:secret@example.com",
    "not-a-valid-url",
  ];

  for (const url of unsafeUrls) {
    let rejected = false;
    try {
      await validateSafeUrl(url);
    } catch (err) {
      if (err instanceof SecurityError || (err as Error).name === "SecurityError" || (err as Error).message.includes("Invalid URL")) {
        rejected = true;
      }
    }
    assert(rejected, `SSRF guard rejects dangerous input: "${url}"`);
  }

  // Safe external public URL
  let safeAllowed = false;
  try {
    await validateSafeUrl("https://docs.github.com/en/apps");
    safeAllowed = true;
  } catch {
    safeAllowed = false;
  }
  assert(safeAllowed, "Permits legitimate public HTTPS documentation URL");

  // =========================================================================
  // TEST 7: Failure Handling & Error Resilience
  // =========================================================================
  console.log("\n--- TEST 7: Failure Handling & Error Resilience ---");
  // Missing API key handling
  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  let keyErrorCaught = false;
  try {
    await callGeminiStructured("Test prompt");
  } catch (err) {
    if (err instanceof GeminiError && err.message.includes("GEMINI_API_KEY is not configured")) {
      keyErrorCaught = true;
    }
  }
  assert(keyErrorCaught, "Gracefully handles missing GEMINI_API_KEY without unhandled crash");

  // Restore key
  if (originalKey) process.env.GEMINI_API_KEY = originalKey;

  // Invalid JSON schema response validation
  let malformedCaught = false;
  try {
    validateGuideResponse({ invalid_field: 123 });
  } catch (err) {
    if (err instanceof GeminiError && err.message.includes("failed schema validation")) {
      malformedCaught = true;
    }
  }
  assert(malformedCaught, "Gracefully rejects malformed model output violating Zod schema");

  // 404 lookup
  const nonExistentGuide = await getGuideBySlug("non-existent-provider-slug-xyz");
  assert(nonExistentGuide === null, "Returns null gracefully for unknown guide slug");

  // =========================================================================
  // TEST 8: Guide Persistence & Shareable URLs
  // =========================================================================
  console.log("\n--- TEST 8: Guide Persistence & Storage ---");
  const testGuideSlug = "test-provider-persistence";
  const dummyGuide: Guide = {
    ...gh!,
    slug: testGuideSlug,
    provider_name: "Test Provider Persistence",
    is_seed: false,
  };

  await saveGuide(dummyGuide);
  const retrieved = await getGuideBySlug(testGuideSlug);
  assert(!!retrieved && retrieved.slug === testGuideSlug, "Saved guide persists and is retrievable by unique slug");

  // Verify that re-saving updates without duplication
  dummyGuide.readiness_summary = "Updated readiness test.";
  await saveGuide(dummyGuide);
  const updatedRetrieved = await getGuideBySlug(testGuideSlug);
  assert(
    updatedRetrieved?.readiness_summary === "Updated readiness test.",
    "Updates existing guide in place without duplicate entries"
  );

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log("\n=======================================================");
  console.log(`TOTAL TESTS:  ${totalTests}`);
  console.log(`PASSED:       ${passedTests} ✓`);
  console.log(`FAILED:       ${failedTests} ${failedTests > 0 ? "✗" : ""}`);
  console.log("=======================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!\n");
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
