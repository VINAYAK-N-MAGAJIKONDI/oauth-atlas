"use client";

import { useState, useMemo } from "react";
import { ScopeItem, ScopeRiskTier } from "@/types/guide";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Lightbulb, CheckSquare, Square, Info } from "lucide-react";

interface Props {
  scopes: ScopeItem[];
  providerName: string;
  onSelectedScopesChange?: (selectedScopes: ScopeItem[]) => void;
}

export function ScopeAuditor({ scopes, providerName, onSelectedScopesChange }: Props) {
  // By default, select standard / non-sensitive scopes or first 2 scopes
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const standard = scopes.filter((s) => s.risk_tier === "standard");
    if (standard.length > 0) {
      standard.forEach((s) => initial.add(s.id));
    } else if (scopes.length > 0) {
      initial.add(scopes[0].id);
    }
    return initial;
  });

  const toggleScope = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
    if (onSelectedScopesChange) {
      onSelectedScopesChange(scopes.filter((s) => next.has(s.id)));
    }
  };

  const selectAll = () => {
    const all = new Set(scopes.map((s) => s.id));
    setSelectedIds(all);
    if (onSelectedScopesChange) onSelectedScopesChange(scopes);
  };

  const selectMinimal = () => {
    const minimal = new Set(scopes.filter((s) => s.risk_tier === "standard").map((s) => s.id));
    setSelectedIds(minimal);
    if (onSelectedScopesChange) {
      onSelectedScopesChange(scopes.filter((s) => minimal.has(s.id)));
    }
  };

  const clearAll = () => {
    setSelectedIds(new Set());
    if (onSelectedScopesChange) onSelectedScopesChange([]);
  };

  // Dynamic risk calculation
  const auditResult = useMemo(() => {
    const selected = scopes.filter((s) => selectedIds.has(s.id));
    if (selected.length === 0) {
      return {
        highestTier: "none" as const,
        tierLabel: "No Scopes Selected",
        hasRestricted: false,
        hasSensitive: false,
        verificationRequired: false,
        requiresCasa: false,
        warnings: [],
        alternatives: [],
        reviewNotice: "Select one or more scopes above to audit review requirements and approval risk.",
      };
    }

    const hasRestricted = selected.some((s) => s.risk_tier === "restricted");
    const hasSensitive = selected.some((s) => s.risk_tier === "sensitive");

    let highestTier: ScopeRiskTier = "standard";
    if (hasRestricted) highestTier = "restricted";
    else if (hasSensitive) highestTier = "sensitive";

    // Collect all warnings & alternative recommendations
    const warnings: string[] = [];
    const alternatives: string[] = [];

    selected.forEach((s) => {
      if (s.warnings && s.warnings.length > 0) {
        s.warnings.forEach((w) => warnings.push(w));
      }
      if (s.alternative_recommendation) {
        alternatives.push(s.alternative_recommendation);
      }
    });

    const isGoogle = providerName.toLowerCase().includes("google");
    const requiresCasa = isGoogle && hasRestricted;

    let reviewNotice = "";
    if (hasRestricted) {
      reviewNotice = requiresCasa
        ? "RESTRICTED AUDIT REQUIRED: Google mandates full Trust & Safety verification AND an independent CASA Tier 2/3 security assessment by an authorized audit lab (cost paid directly to assessor, multi-week turnaround)."
        : "RESTRICTED SCOPE SELECTED: High security scrutiny or organization administrator approval required before production deployment.";
    } else if (hasSensitive) {
      reviewNotice = isGoogle
        ? "SENSITIVE SCOPE: Requires Google OAuth App Verification (privacy policy, verified domain, and YouTube video demo), but avoids third-party CASA security assessment."
        : "SENSITIVE SCOPE: Higher user permission scrutiny and potential corporate admin approval gates.";
    } else {
      reviewNotice =
        "STANDARD / SELF-SERVE: Low friction. Does not require formal third-party security audits or manual approval queues.";
    }

    return {
      highestTier,
      tierLabel:
        highestTier === "restricted"
          ? "Restricted Risk Tier"
          : highestTier === "sensitive"
          ? "Sensitive Risk Tier"
          : "Standard / Non-Sensitive Tier",
      hasRestricted,
      hasSensitive,
      verificationRequired: hasRestricted || hasSensitive,
      requiresCasa,
      warnings,
      alternatives: Array.from(new Set(alternatives)),
      reviewNotice,
    };
  }, [scopes, selectedIds, providerName]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            Interactive Scope Risk Auditor
          </h3>
          <p className="text-xs text-neutral-400">
            Select the scopes your application intends to request to dynamically calculate approval complexity.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={selectMinimal}
            className="px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
          >
            Recommended Minimal
          </button>
          <button
            onClick={selectAll}
            className="px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Scopes Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {scopes.map((scope) => {
          const isSelected = selectedIds.has(scope.id);
          const isRestricted = scope.risk_tier === "restricted";
          const isSensitive = scope.risk_tier === "sensitive";

          return (
            <div
              key={scope.id}
              onClick={() => toggleScope(scope.id)}
              className={`cursor-pointer rounded-lg border p-3.5 transition-all select-none ${
                isSelected
                  ? isRestricted
                    ? "border-red-500/40 bg-red-950/20"
                    : isSensitive
                    ? "border-amber-500/40 bg-amber-950/20"
                    : "border-emerald-500/40 bg-emerald-950/20"
                  : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 text-neutral-400">
                    {isSelected ? (
                      <CheckSquare
                        className={`h-4 w-4 ${
                          isRestricted
                            ? "text-red-400"
                            : isSensitive
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono font-medium text-white break-all">
                        {scope.name}
                      </code>
                      {scope.category && (
                        <span className="rounded bg-neutral-800 px-1.5 py-0.2 text-[10px] text-neutral-400">
                          {scope.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {scope.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      isRestricted
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : isSensitive
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {scope.risk_tier}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Calculation Summary Card */}
      <div
        className={`rounded-xl border p-5 transition-colors ${
          auditResult.hasRestricted
            ? "border-red-500/30 bg-red-950/15"
            : auditResult.hasSensitive
            ? "border-amber-500/30 bg-amber-950/15"
            : auditResult.highestTier === "standard"
            ? "border-emerald-500/30 bg-emerald-950/15"
            : "border-neutral-800 bg-neutral-900/60"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                auditResult.hasRestricted
                  ? "bg-red-500/20 text-red-400"
                  : auditResult.hasSensitive
                  ? "bg-amber-500/20 text-amber-400"
                  : auditResult.highestTier === "standard"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-neutral-800 text-neutral-400"
              }`}
            >
              {auditResult.hasRestricted ? (
                <ShieldAlert className="h-5 w-5" />
              ) : auditResult.hasSensitive ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Calculated Risk Assessment
                </span>
                <span className="text-xs text-neutral-400">
                  ({selectedIds.size} of {scopes.length} scopes active)
                </span>
              </div>
              <h4 className="text-base font-semibold text-white">
                {auditResult.tierLabel}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span
              className={`rounded-md px-2.5 py-1 font-medium ${
                auditResult.verificationRequired
                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              }`}
            >
              {auditResult.verificationRequired
                ? "Provider Verification Required"
                : "Self-Serve / Immediate"}
            </span>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <p className="text-sm text-neutral-300 leading-relaxed">
            {auditResult.reviewNotice}
          </p>

          {auditResult.requiresCasa && (
            <div className="rounded-lg bg-red-950/40 border border-red-500/30 p-3.5 flex items-start gap-3 text-xs text-red-200">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-100">
                  Critical Launch Blocker: Third-Party CASA Assessment
                </p>
                <p className="mt-1 text-neutral-300 leading-relaxed">
                  Requesting restricted Drive scopes requires retaining an authorized third-party lab (e.g. Bishop Fox, Leviathan). Assessment fees ($1,500 - $6,000+) are paid directly to the lab and typically take 4–8 weeks.
                </p>
              </div>
            </div>
          )}

          {auditResult.alternatives.length > 0 && (
            <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-3.5 flex items-start gap-3 text-xs text-emerald-200">
              <Lightbulb className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-100">
                  Architectural Recommendation to Accelerate Launch
                </p>
                {auditResult.alternatives.map((alt, idx) => (
                  <p key={idx} className="mt-1 text-neutral-300 leading-relaxed">
                    {alt}
                  </p>
                ))}
              </div>
            </div>
          )}

          {auditResult.warnings.length > 0 && (
            <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 text-xs text-neutral-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-neutral-300">
                <Info className="h-3.5 w-3.5 text-neutral-400" />
                <span>Scope Caveats & User Friction:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                {auditResult.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
