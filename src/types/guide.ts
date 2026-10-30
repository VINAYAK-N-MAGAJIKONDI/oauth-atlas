import { z } from "zod";

export const ResponsibilityBadgeSchema = z.enum([
  "HUMAN REQUIRED",
  "AGENT AUTOMATABLE",
  "HYBRID",
]);
export type ResponsibilityBadge = z.infer<typeof ResponsibilityBadgeSchema>;

export const EvidenceTypeSchema = z.enum([
  "DOC_BACKED",
  "PORTAL_OBSERVED",
  "ESTIMATE",
  "UNSPECIFIED IN DOCS",
]);
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

export const ResearchStatusSchema = z.enum([
  "verified",
  "partially_verified",
  "insufficient_evidence",
]);
export type ResearchStatus = z.infer<typeof ResearchStatusSchema>;

export const ScopeRiskTierSchema = z.enum([
  "standard",
  "sensitive",
  "restricted",
  "unknown",
]);
export type ScopeRiskTier = z.infer<typeof ScopeRiskTierSchema>;

export const SetupStepSchema = z.object({
  id: z.string(),
  step_number: z.number(),
  title: z.string(),
  explanation: z.string(),
  exact_action: z.string(),
  required_inputs: z.array(z.string()),
  expected_result: z.string(),
  responsibility: ResponsibilityBadgeSchema,
  source_evidence_id: z.string().optional(),
});
export type SetupStep = z.infer<typeof SetupStepSchema>;

export const ReadinessPhaseSchema = z.object({
  title: z.string(),
  status: z.string(),
  summary: z.string(),
  allowed_users: z.string(),
  verification_required: z.union([z.boolean(), z.string()]),
  details: z.array(z.string()),
});
export type ReadinessPhase = z.infer<typeof ReadinessPhaseSchema>;

export const ManagedOAuthSchema = z.object({
  available: z.enum(["yes", "no", "unknown"]),
  provider: z.string().default("Composio"),
  what_it_handles: z.array(z.string()),
  what_you_configure: z.array(z.string()),
  prototyping_suitability: z.string(),
  limitations: z.array(z.string()),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
    })
  ),
});
export type ManagedOAuth = z.infer<typeof ManagedOAuthSchema>;

export const CustomOAuthSchema = z.object({
  available: z.boolean(),
  prerequisites: z.array(z.string()),
  setup_steps: z.array(SetupStepSchema),
  branding_and_consent_requirements: z.array(z.string()),
  verification_checklist: z.array(z.string()),
  production_checklist: z.array(z.string()),
});
export type CustomOAuth = z.infer<typeof CustomOAuthSchema>;

export const ScopeItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  risk_tier: ScopeRiskTierSchema,
  category: z.string().optional(),
  verification_requirements: z.array(z.string()),
  warnings: z.array(z.string()).optional(),
  alternative_recommendation: z.string().optional(),
  source_ids: z.array(z.string()),
});
export type ScopeItem = z.infer<typeof ScopeItemSchema>;

export const EffortDetailSchema = z.object({
  value: z.string(),
  is_estimate: z.boolean().default(false),
  is_documented: z.boolean().default(false),
  details: z.string(),
  source_id: z.string().optional(),
});
export type EffortDetail = z.infer<typeof EffortDetailSchema>;

export const EffortAndTimelineSchema = z.object({
  active_setup: EffortDetailSchema,
  external_review: EffortDetailSchema,
  audit_cost: EffortDetailSchema,
});
export type EffortAndTimeline = z.infer<typeof EffortAndTimelineSchema>;

export const BlockerSchema = z.object({
  id: z.string(),
  error_or_symptom: z.string(),
  likely_cause: z.string(),
  suggested_resolution: z.string(),
  relevant_source_url: z.string().optional(),
});
export type Blocker = z.infer<typeof BlockerSchema>;

export const ClaimEvidenceSchema = z.object({
  id: z.string(),
  claim: z.string(),
  evidence_type: EvidenceTypeSchema,
  source_title: z.string(),
  source_url: z.string(),
  verbatim_quote: z.string(),
  retrieved_at: z.string().optional(),
});
export type ClaimEvidence = z.infer<typeof ClaimEvidenceSchema>;

export const GuideSchema = z.object({
  slug: z.string(),
  provider_name: z.string(),
  category: z.string().default("Developer Tools & Productivity"),
  description: z.string(),
  official_domain: z.string(),
  documentation_urls: z.array(z.string()),
  oauth_portal_url: z.string().optional(),
  last_researched_at: z.string(),
  research_status: ResearchStatusSchema,
  readiness_summary: z.string(),
  complexity: z.enum(["Low", "Moderate", "High", "Very High"]).default("Moderate"),
  readiness: z.object({
    development: ReadinessPhaseSchema,
    external_testing: ReadinessPhaseSchema,
    public_distribution: ReadinessPhaseSchema,
    production: ReadinessPhaseSchema,
  }),
  managed_oauth: ManagedOAuthSchema,
  custom_oauth: CustomOAuthSchema,
  scopes: z.array(ScopeItemSchema),
  effort_and_timeline: EffortAndTimelineSchema,
  blockers: z.array(BlockerSchema),
  unknowns_and_limitations: z.array(z.string()),
  claims_and_evidence: z.array(ClaimEvidenceSchema),
  is_seed: z.boolean().default(false),
});

export type Guide = z.infer<typeof GuideSchema>;

export type ResearchStage = "discover" | "extract" | "investigate" | "validate" | "generate";
export type StageStatus = "pending" | "running" | "completed" | "failed";

export interface ResearchStageState {
  stage: ResearchStage;
  name: string;
  status: StageStatus;
  message: string;
  sources_found?: { title: string; url: string }[];
}

export interface ResearchRun {
  run_id: string;
  app_input: string;
  status: "pending" | "running" | "completed" | "failed";
  stages: ResearchStageState[];
  generated_slug?: string;
  error?: string;
  created_at: string;
  updated_at: string;
}
