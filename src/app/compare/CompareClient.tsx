"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Guide } from "@/types/guide";
import { ResearchAgentModal } from "@/components/ResearchAgentModal";
import {
  GitCompare,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  Layers,
  User,
  Plus,
  X,
  Search,
  Sparkles,
  Bot,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

interface Props {
  allGuides: Guide[];
}

export function CompareClient({ allGuides }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial selection from URL query param `?apps=github,slack,google-drive`
  const initialSelection = useMemo(() => {
    const appsParam = searchParams.get("apps");
    if (appsParam) {
      const slugs = appsParam.split(",").map((s) => s.trim().toLowerCase());
      const matched = slugs.filter((s) => allGuides.some((g) => g.slug === s));
      if (matched.length > 0) return matched;
    }
    // Default trio if available
    const defaultSlugs = ["github", "slack", "google-drive"].filter((s) =>
      allGuides.some((g) => g.slug === s)
    );
    return defaultSlugs.length > 0
      ? defaultSlugs
      : allGuides.slice(0, 3).map((g) => g.slug);
  }, [searchParams, allGuides]);

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialSelection);
  const [searchFilter, setSearchFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync selection to URL query parameter without full page reload
  useEffect(() => {
    const currentQuery = searchParams.get("apps");
    const nextQuery = selectedSlugs.join(",");
    if (currentQuery !== nextQuery) {
      const url = nextQuery ? `/compare?apps=${nextQuery}` : "/compare";
      window.history.replaceState(null, "", url);
    }
  }, [selectedSlugs, searchParams]);

  const toggleSlug = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
    } else {
      setSelectedSlugs([...selectedSlugs, slug]);
    }
  };

  const removeSlug = (slug: string) => {
    setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
  };

  const selectPrebuiltTrio = () => {
    const trio = ["github", "slack", "google-drive"].filter((s) =>
      allGuides.some((g) => g.slug === s)
    );
    setSelectedSlugs(trio);
  };

  const selectAll = () => {
    setSelectedSlugs(allGuides.map((g) => g.slug));
  };

  const clearAll = () => {
    setSelectedSlugs([]);
  };

  // Filter available guides for the selection toolbar
  const visibleGuidesInToolbar = useMemo(() => {
    if (!searchFilter.trim()) return allGuides;
    const q = searchFilter.toLowerCase();
    return allGuides.filter(
      (g) =>
        g.provider_name.toLowerCase().includes(q) ||
        g.slug.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
    );
  }, [allGuides, searchFilter]);

  // Selected guide objects in order of selection
  const selectedGuides = useMemo(() => {
    return selectedSlugs
      .map((slug) => allGuides.find((g) => g.slug === slug))
      .filter((g): g is Guide => Boolean(g));
  }, [selectedSlugs, allGuides]);

  // Complexity badge color styling
  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case "Low":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Moderate":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "High":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Very High":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col pb-24 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/30 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <GitCompare className="h-3.5 w-3.5" />
            <span>Interactive Side-by-Side Matrix</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Provider OAuth & Approval Comparison
          </h1>
          <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
            Select and compare OAuth requirements, scope sensitivity models, review wait times, audit costs, and automation opportunities across your chosen providers.
          </p>

          {/* Controls & Quick Select Toolbar */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-400 font-medium mr-1">Presets:</span>
            <button
              onClick={selectPrebuiltTrio}
              className="rounded-lg border border-neutral-700/80 bg-neutral-800/60 px-3 py-1.5 text-neutral-300 hover:text-white hover:border-neutral-600 transition"
            >
              Default Trio (GitHub, Slack, Google)
            </button>
            <button
              onClick={selectAll}
              className="rounded-lg border border-neutral-700/80 bg-neutral-800/60 px-3 py-1.5 text-neutral-300 hover:text-white hover:border-neutral-600 transition"
            >
              Select All ({allGuides.length})
            </button>
            <button
              onClick={clearAll}
              className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-neutral-400 hover:text-neutral-200 transition"
            >
              Clear Selection
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>+ Investigate New App</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 flex-1 w-full space-y-8">
        {/* Interactive Provider Selector Chips */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Choose Providers to Compare</span>
                <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold">
                  {selectedSlugs.length} selected
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Toggle pills below to add or remove providers from the comparison columns.
              </p>
            </div>

            {/* Filter input */}
            {allGuides.length > 4 && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Filter available apps..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Chips Grid */}
          <div className="flex flex-wrap gap-2 pt-1">
            {visibleGuidesInToolbar.map((guide) => {
              const isSelected = selectedSlugs.includes(guide.slug);
              return (
                <button
                  key={guide.slug}
                  onClick={() => toggleSlug(guide.slug)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-950"
                      : "border-neutral-800 bg-neutral-950/70 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isSelected ? "bg-emerald-400" : "bg-neutral-600"
                    }`}
                  />
                  <span>{guide.provider_name}</span>
                  {guide.is_seed && (
                    <span className="rounded bg-neutral-800 text-neutral-400 px-1.5 py-0.2 text-[9px] font-medium">
                      Seed
                    </span>
                  )}
                  {isSelected && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty State when fewer than 2 are selected */}
        {selectedGuides.length < 2 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-12 text-center space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-neutral-800/80 border border-neutral-700 text-neutral-400">
              <GitCompare className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              {selectedGuides.length === 0
                ? "No providers selected"
                : "Select at least 2 providers to compare"}
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              Choose 2 or more providers from the pills above to view a detailed side-by-side architectural and readiness comparison.
            </p>
            <button
              onClick={selectPrebuiltTrio}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Load Default Comparison Trio</span>
            </button>
          </div>
        ) : (
          /* Dynamic Comparison Matrix */
          <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/40 shadow-xl shadow-black/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/90">
                  <th className="p-4 sm:p-5 font-semibold text-neutral-400 w-64 min-w-[200px]">
                    Evaluation Dimension
                  </th>
                  {selectedGuides.map((guide) => (
                    <th
                      key={guide.slug}
                      className="p-4 sm:p-5 font-bold text-white min-w-[260px] align-top"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-extrabold text-white">
                            {guide.provider_name}
                          </span>
                          <button
                            onClick={() => removeSlug(guide.slug)}
                            title="Remove from comparison"
                            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${getComplexityBadge(
                              guide.complexity
                            )}`}
                          >
                            {guide.complexity} Complexity
                          </span>

                          <Link
                            href={`/guides/${guide.slug}`}
                            className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <span>Open Playbook</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800/80">
                {/* Row 1: App Registration Complexity */}
                <tr className="hover:bg-neutral-900/40 transition">
                  <td className="p-4 sm:p-5 font-semibold text-neutral-300 align-top">
                    <div className="font-bold text-white">App Registration Complexity</div>
                    <div className="text-[11px] text-neutral-500 font-normal mt-0.5">
                      Console overhead & credential setup
                    </div>
                  </td>
                  {selectedGuides.map((guide) => (
                    <td key={guide.slug} className="p-4 sm:p-5 text-neutral-300 align-top">
                      <span
                        className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${getComplexityBadge(
                          guide.complexity
                        )}`}
                      >
                        {guide.complexity}
                      </span>
                      <p className="mt-2 text-neutral-400 leading-relaxed">
                        {guide.custom_oauth.prerequisites.slice(0, 2).join(". ") ||
                          guide.readiness_summary}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Row 2: Scope Sensitivity Model */}
                <tr className="hover:bg-neutral-900/40 transition">
                  <td className="p-4 sm:p-5 font-semibold text-neutral-300 align-top">
                    <div className="font-bold text-white">Scope Sensitivity Model</div>
                    <div className="text-[11px] text-neutral-500 font-normal mt-0.5">
                      Friction tiers & permission scrutiny
                    </div>
                  </td>
                  {selectedGuides.map((guide) => {
                    const restrictedCount = guide.scopes.filter((s) => s.risk_tier === "restricted").length;
                    const sensitiveCount = guide.scopes.filter((s) => s.risk_tier === "sensitive").length;
                    const standardCount = guide.scopes.filter((s) => s.risk_tier === "standard").length;

                    return (
                      <td key={guide.slug} className="p-4 sm:p-5 text-neutral-400 align-top">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {standardCount > 0 && (
                            <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold">
                              {standardCount} Standard
                            </span>
                          )}
                          {sensitiveCount > 0 && (
                            <span className="rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold">
                              {sensitiveCount} Sensitive
                            </span>
                          )}
                          {restrictedCount > 0 && (
                            <span className="rounded bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 text-[9px] font-semibold">
                              {restrictedCount} Restricted
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-400 leading-relaxed">
                          {guide.slug === "google-drive"
                            ? "Strict 3-tier model: Non-sensitive (drive.file), Sensitive, and Restricted with mandatory CASA audits."
                            : guide.slug === "slack"
                            ? "Bot scopes vs User scopes. Granular permissions required per action."
                            : guide.slug === "github"
                            ? "Granular scopes (repo, user), but all self-serve with zero verification review."
                            : `${guide.scopes.length} documented scopes with tiered permission requirements.`}
                        </p>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 3: Development Mode Limits */}
                <tr className="hover:bg-neutral-900/40 transition">
                  <td className="p-4 sm:p-5 font-semibold text-neutral-300 align-top">
                    <div className="font-bold text-white">Development Mode Limits</div>
                    <div className="text-[11px] text-neutral-500 font-normal mt-0.5">
                      Sandbox constraints & token expiration
                    </div>
                  </td>
                  {selectedGuides.map((guide) => (
                    <td key={guide.slug} className="p-4 sm:p-5 text-neutral-400 align-top">
                      <div className="font-semibold text-neutral-200">
                        {guide.readiness.development.status}
                      </div>
                      <p className="mt-1 text-neutral-400 leading-relaxed">
                        {guide.readiness.development.summary}
                      </p>
                      <div className="mt-2 text-[11px] text-neutral-500">
                        <span className="font-medium text-neutral-400">Users:</span>{" "}
                        {guide.readiness.development.allowed_users}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row 4: Public Distribution Requirements */}
                <tr className="hover:bg-neutral-900/40 transition">
                  <td className="p-4 sm:p-5 font-semibold text-neutral-300 align-top">
                    <div className="font-bold text-white">Public Distribution Flow</div>
                    <div className="text-[11px] text-neutral-500 font-normal mt-0.5">
                      Moving from internal to external users
                    </div>
                  </td>
                  {selectedGuides.map((guide) => (
                    <td key={guide.slug} className="p-4 sm:p-5 text-neutral-400 align-top">
                      <div className="font-semibold text-neutral-200">
                        {guide.readiness.public_distribution.status}
                      </div>
                      <p className="mt-1 text-neutral-400 leading-relaxed">
                        {guide.readiness.public_distribution.summary}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Row 5: Provider Verification */}
                <tr className="hover:bg-neutral-900/40 transition">
                  <td className="p-4 sm:p-5 font-semibold text-neutral-300 align-top">
                    <div className="font-bold text-white">Mandatory Verification</div>
                    <div className="text-[11px] text-neutral-500 font-normal mt-0.5">
                      Reviews required before production
                    </div>
                  </td>
                  {selectedGuides.map((guide) => {
                    const req = guide.readiness.public_distribution.verification_required;
                    const isRequired = typeof req === "boolean" ? req : req !== "none" && req !== "No";

                    return (
                      <td key={guide.slug} className="p-4 sm:p-5 align-top">
                        <span
                          className={`font-semibold ${
                            isRequired ? "text-amber-400" : "text-emerald-400"
                          }`}
                        >
                          {isRequired ? "Verification Required" : "No Review Required (Self-Serve)"}
                        </span>
                        <p className="mt-1 text-neutral-400 leading-relaxed text-[11px]">
                          {guide.readiness.public_distribution.details[0] ||
                            guide.readiness.production.details[0] ||
                            "Standard HTTPS redirect endpoints required."}
                        </p>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 6: External Review Waiting Time */}
                <tr className="hover:bg-neutral-900/40 transition">
                  <td className="p-4 sm:p-5 font-semibold text-neutral-300 align-top">
                    <div className="font-bold text-white">External Review Wait</div>
                    <div className="text-[11px] text-neutral-500 font-normal mt-0.5">
                      Time spent waiting for provider approval
                    </div>
                  </td>
                  {selectedGuides.map((guide) => {
                    const wait = guide.effort_and_timeline.external_review.value;
                    const isInstant =
                      wait.toLowerCase().includes("0 day") ||
                      wait.toLowerCase().includes("instant") ||
                      wait.toLowerCase().includes("none");

                    return (
                      <td key={guide.slug} className="p-4 sm:p-5 align-top">
                        <div
                          className={`font-bold ${
                            isInstant
                              ? "text-emerald-400"
                              : wait.includes("week")
                              ? "text-red-400"
                              : "text-amber-400"
                          }`}
                        >
                          {wait}
                        </div>
                        <p className="mt-1 text-neutral-400 leading-relaxed text-[11px]">
                          {guide.effort_and_timeline.external_review.details}
                        </p>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 7: Direct Audit / Certification Costs */}
                <tr className="hover:bg-neutral-900/40 transition">
                  <td className="p-4 sm:p-5 font-semibold text-neutral-300 align-top">
                    <div className="font-bold text-white">Direct Audit Fees</div>
                    <div className="text-[11px] text-neutral-500 font-normal mt-0.5">
                      Third-party security assessment costs
                    </div>
                  </td>
                  {selectedGuides.map((guide) => {
                    const cost = guide.effort_and_timeline.audit_cost.value;
                    const isFree =
                      cost.toLowerCase().includes("$0") ||
                      cost.toLowerCase().includes("free") ||
                      cost.toLowerCase().includes("none");

                    return (
                      <td key={guide.slug} className="p-4 sm:p-5 align-top">
                        <div
                          className={`font-bold ${
                            isFree ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {cost}
                        </div>
                        <p className="mt-1 text-neutral-400 leading-relaxed text-[11px]">
                          {guide.effort_and_timeline.audit_cost.details}
                        </p>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 8: Human Involvement Requirement */}
                <tr className="hover:bg-neutral-900/40 transition">
                  <td className="p-4 sm:p-5 font-semibold text-neutral-300 align-top">
                    <div className="font-bold text-white">Human Involvement</div>
                    <div className="text-[11px] text-neutral-500 font-normal mt-0.5">
                      Tasks requiring developer credentials
                    </div>
                  </td>
                  {selectedGuides.map((guide) => {
                    const humanSteps = guide.custom_oauth.setup_steps.filter(
                      (s) => s.responsibility === "HUMAN REQUIRED"
                    );

                    return (
                      <td key={guide.slug} className="p-4 sm:p-5 text-neutral-400 align-top">
                        <div className="font-semibold text-neutral-300 mb-1">
                          {humanSteps.length} Human Actions Required
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-400">
                          {humanSteps.slice(0, 2).map((s) => (
                            <li key={s.id}>{s.title}</li>
                          ))}
                        </ul>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 9: Primary Launch Blocker */}
                <tr className="hover:bg-neutral-900/40 transition">
                  <td className="p-4 sm:p-5 font-semibold text-neutral-300 align-top">
                    <div className="font-bold text-white">Primary Launch Blocker</div>
                    <div className="text-[11px] text-neutral-500 font-normal mt-0.5">
                      Most common failure mode or gotcha
                    </div>
                  </td>
                  {selectedGuides.map((guide) => {
                    const topBlocker = guide.blockers[0];

                    return (
                      <td key={guide.slug} className="p-4 sm:p-5 text-neutral-400 align-top">
                        {topBlocker ? (
                          <div>
                            <div className="font-semibold text-amber-300 text-[11px]">
                              {topBlocker.error_or_symptom}
                            </div>
                            <p className="mt-1 text-neutral-400 leading-relaxed text-[11px]">
                              {topBlocker.suggested_resolution}
                            </p>
                          </div>
                        ) : (
                          <div className="text-neutral-500 italic">No critical blocker documented</div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Row 10: Managed OAuth (Composio) */}
                <tr className="hover:bg-neutral-900/40 transition">
                  <td className="p-4 sm:p-5 font-semibold text-neutral-300 align-top">
                    <div className="font-bold text-white">Managed OAuth (Composio)</div>
                    <div className="text-[11px] text-neutral-500 font-normal mt-0.5">
                      Zero-infrastructure alternative track
                    </div>
                  </td>
                  {selectedGuides.map((guide) => (
                    <td key={guide.slug} className="p-4 sm:p-5 text-neutral-400 align-top">
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                          guide.managed_oauth.available === "yes"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-neutral-800 text-neutral-400 border-neutral-700"
                        }`}
                      >
                        {guide.managed_oauth.available === "yes"
                          ? "Supported by Composio"
                          : "Custom OAuth Only"}
                      </span>
                      <p className="mt-2 text-neutral-400 leading-relaxed text-[11px]">
                        {guide.managed_oauth.prototyping_suitability}
                      </p>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Research Modal for adding new providers */}
      <ResearchAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
