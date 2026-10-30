"use client";

import { useState } from "react";
import Link from "next/link";
import { Guide, ScopeItem } from "@/types/guide";
import { ScopeAuditor } from "./ScopeAuditor";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { ArtifactModal } from "./ArtifactModal";
import { ResponsibilityBadge } from "./ResponsibilityBadge";
import { EvidenceBadge } from "./EvidenceBadge";
import {
  Compass,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertOctagon,
  FileText,
  Layers,
  ChevronRight,
  GitBranch,
  ShieldAlert,
  Info,
  Calendar,
} from "lucide-react";

interface Props {
  guide: Guide;
}

export function GuideDetailClient({ guide }: Props) {
  const [selectedTrack, setSelectedTrack] = useState<"custom" | "managed">("custom");
  const [selectedScopes, setSelectedScopes] = useState<ScopeItem[]>(guide.scopes);
  const [activeStepTab, setActiveStepTab] = useState<number | null>(null);

  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case "Low":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Moderate":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "High":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Very High":
      default:
        return "bg-red-500/10 text-red-400 border-red-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col pb-20 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Breadcrumb Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Directory</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Last Researched:</span>
            <span className="text-neutral-300 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-neutral-400" />
              {guide.last_researched_at || "Recent"}
            </span>
            <span className="text-neutral-700">•</span>
            <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase">
              {guide.research_status}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-10 flex-1 w-full">
        {/* Section A: Provider Overview Hero */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {guide.provider_name}
                </h1>
                <span
                  className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getComplexityBadge(
                    guide.complexity
                  )}`}
                >
                  {guide.complexity} Approval Complexity
                </span>
              </div>
              <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed">
                {guide.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {guide.oauth_portal_url && (
                <a
                  href={guide.oauth_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 text-xs font-medium border border-neutral-700 transition-colors"
                >
                  <span>Developer Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {guide.documentation_urls?.[0] && (
                <a
                  href={guide.documentation_urls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 text-xs font-medium border border-emerald-500/20 transition-colors"
                >
                  <span>Official Docs</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Readiness Summary Callout */}
          <div className="rounded-xl bg-neutral-950/80 border border-neutral-800 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Production Readiness Summary
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {guide.readiness_summary}
              </p>
            </div>
          </div>
        </div>

        {/* Section B: Readiness Overview (4 Distinct Phases) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              Four-Phase Launch Readiness Matrix
            </h2>
            <p className="text-xs text-neutral-400">
              Clear distinction between initial prototyping, external beta testing, and public enterprise distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Phase 1: Development */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-400">
                  Phase 1
                </span>
                <span className="text-[11px] font-semibold text-emerald-400">
                  {guide.readiness.development.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                {guide.readiness.development.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {guide.readiness.development.summary}
              </p>
              <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <p>
                  <strong>Audience:</strong> {guide.readiness.development.allowed_users}
                </p>
              </div>
            </div>

            {/* Phase 2: External Testing */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-400">
                  Phase 2
                </span>
                <span className="text-[11px] font-semibold text-sky-400">
                  {guide.readiness.external_testing.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                {guide.readiness.external_testing.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {guide.readiness.external_testing.summary}
              </p>
              <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <p>
                  <strong>Audience:</strong> {guide.readiness.external_testing.allowed_users}
                </p>
              </div>
            </div>

            {/* Phase 3: Public Distribution */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-400">
                  Phase 3
                </span>
                <span className="text-[11px] font-semibold text-amber-400">
                  {guide.readiness.public_distribution.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                {guide.readiness.public_distribution.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {guide.readiness.public_distribution.summary}
              </p>
              <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <p>
                  <strong>Audience:</strong> {guide.readiness.public_distribution.allowed_users}
                </p>
              </div>
            </div>

            {/* Phase 4: Production */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-400">
                  Phase 4
                </span>
                <span className="text-[11px] font-semibold text-purple-400">
                  {guide.readiness.production.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                {guide.readiness.production.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {guide.readiness.production.summary}
              </p>
              <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <p>
                  <strong>Audience:</strong> {guide.readiness.production.allowed_users}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section C: Setup Track Selector (Custom OAuth vs Managed OAuth) */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-emerald-400" />
                Integration Architecture Tracks
              </h2>
              <p className="text-xs text-neutral-400">
                Compare maintaining custom OAuth credentials versus utilizing a managed authentication proxy.
              </p>
            </div>

            <div className="flex items-center rounded-lg bg-neutral-950 p-1 border border-neutral-800">
              <button
                onClick={() => setSelectedTrack("custom")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedTrack === "custom"
                    ? "bg-neutral-800 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Custom OAuth (Direct)
              </button>
              <button
                onClick={() => setSelectedTrack("managed")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedTrack === "managed"
                    ? "bg-neutral-800 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Managed OAuth ({guide.managed_oauth.provider})
              </button>
            </div>
          </div>

          {selectedTrack === "custom" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Developer Account Prerequisites
                  </h4>
                  <ul className="space-y-1 text-xs text-neutral-400">
                    {guide.custom_oauth.prerequisites.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Branding & Consent Requirements
                  </h4>
                  <ul className="space-y-1 text-xs text-neutral-400">
                    {guide.custom_oauth.branding_and_consent_requirements.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-sky-400">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 text-xs text-neutral-300 leading-relaxed">
                <strong>Custom OAuth Advantage:</strong> Total brand ownership, zero third-party proxy dependencies, and direct control over refresh tokens and client secret rotation.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    What {guide.managed_oauth.provider} Handles
                  </h4>
                  <ul className="space-y-1 text-xs text-neutral-400">
                    {guide.managed_oauth.what_it_handles.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Trade-offs & Known Limitations
                  </h4>
                  <ul className="space-y-1 text-xs text-neutral-400">
                    {guide.managed_oauth.limitations.map((l, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400">⚠</span>
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <p className="text-neutral-300">
                  <strong>Prototyping Suitability:</strong> {guide.managed_oauth.prototyping_suitability}
                </p>
                {guide.managed_oauth.sources?.[0] && (
                  <a
                    href={guide.managed_oauth.sources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:underline shrink-0"
                  >
                    <span>{guide.managed_oauth.sources[0].title}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section E: Interactive Scope Risk Auditor */}
        <ScopeAuditor
          scopes={guide.scopes}
          providerName={guide.provider_name}
          onSelectedScopesChange={(scopes) => setSelectedScopes(scopes)}
        />

        {/* Section F: Time & Effort Estimator (Separated Active vs Review vs Cost) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              Time, Review Queues & Cost Decomposition
            </h2>
            <p className="text-xs text-neutral-400">
              Active engineering effort separated from external provider review waiting queues and audit fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Active Developer Setup
                </span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  {guide.effort_and_timeline.active_setup.is_estimate ? "Estimate" : "Doc-Backed"}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-white">
                {guide.effort_and_timeline.active_setup.value}
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {guide.effort_and_timeline.active_setup.details}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  External Provider Review Wait
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {guide.effort_and_timeline.external_review.is_documented ? "Documented" : "Estimate"}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-white">
                {guide.effort_and_timeline.external_review.value}
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {guide.effort_and_timeline.external_review.details}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Mandatory Audit & Assessment Fees
                </span>
                <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                  {guide.effort_and_timeline.audit_cost.is_documented ? "Documented" : "Estimated"}
                </span>
              </div>
              <p className="text-lg font-bold text-white break-words">
                {guide.effort_and_timeline.audit_cost.value}
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {guide.effort_and_timeline.audit_cost.details}
              </p>
            </div>
          </div>
        </div>

        {/* Section D: Sequential Setup Steps Checklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                Sequential Implementation Playbook
              </h2>
              <p className="text-xs text-neutral-400">
                Actionable steps tagged with responsibility: Human Required vs Agent Automatable.
              </p>
            </div>
            <span className="text-xs text-neutral-400">
              {guide.custom_oauth.setup_steps.length} sequential steps
            </span>
          </div>

          <div className="space-y-3">
            {guide.custom_oauth.setup_steps.map((step) => {
              const isOpen = activeStepTab === step.step_number;

              return (
                <div
                  key={step.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 transition-colors hover:border-neutral-700"
                >
                  <div
                    onClick={() => setActiveStepTab(isOpen ? null : step.step_number)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800 text-xs font-mono font-bold text-neutral-200 shrink-0">
                        {step.step_number}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          {step.title}
                        </h4>
                        <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                          {step.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <ResponsibilityBadge responsibility={step.responsibility} />
                      <ChevronRight
                        className={`h-4 w-4 text-neutral-500 transition-transform ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Step Details */}
                  {isOpen && (
                    <div className="pt-4 mt-3 border-t border-neutral-800/80 space-y-3 text-xs">
                      <div>
                        <span className="font-semibold text-neutral-300">Exact Action:</span>
                        <p className="text-neutral-400 mt-0.5 leading-relaxed bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/60 font-mono">
                          {step.exact_action}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="font-semibold text-neutral-300">Required Inputs:</span>
                          <ul className="list-disc list-inside mt-1 text-neutral-400 space-y-0.5">
                            {step.required_inputs.map((inp, idx) => (
                              <li key={idx}>{inp}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="font-semibold text-neutral-300">Expected Result:</span>
                          <p className="text-neutral-400 mt-1 leading-relaxed">
                            {step.expected_result}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section G: Common Blockers & Error Recovery Playbooks */}
        {guide.blockers.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertOctagon className="h-4 w-4 text-amber-400" />
                Launch Blockers & Error Recovery Playbooks
              </h2>
              <p className="text-xs text-neutral-400">
                Common authorization errors, root causes, and verified resolutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guide.blockers.map((blocker) => (
                <div
                  key={blocker.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3"
                >
                  <div className="flex items-start gap-2 text-red-400">
                    <AlertOctagon className="h-4 w-4 shrink-0 mt-0.5" />
                    <code className="text-xs font-mono font-bold text-red-300 break-words">
                      {blocker.error_or_symptom}
                    </code>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-neutral-300">Likely Cause:</span>
                    <p className="text-neutral-400 leading-relaxed">
                      {blocker.likely_cause}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs pt-2 border-t border-neutral-800">
                    <span className="font-semibold text-emerald-400">Suggested Resolution:</span>
                    <p className="text-neutral-300 leading-relaxed">
                      {blocker.suggested_resolution}
                    </p>
                  </div>

                  {blocker.relevant_source_url && (
                    <div className="pt-1">
                      <a
                        href={blocker.relevant_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                      >
                        <span>Official Error Reference</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section I: Launch Artifact Generator */}
        <ArtifactModal guide={guide} selectedScopes={selectedScopes} />

        {/* Section H: Evidence Ledger & Drawer */}
        <EvidenceDrawer claims={guide.claims_and_evidence} providerName={guide.provider_name} />
      </div>
    </div>
  );
}
