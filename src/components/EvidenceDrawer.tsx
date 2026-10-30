"use client";

import { useState } from "react";
import { ClaimEvidence, EvidenceType } from "@/types/guide";
import { EvidenceBadge } from "./EvidenceBadge";
import { ExternalLink, Search, ShieldCheck, Quote, X, ChevronRight } from "lucide-react";

interface Props {
  claims: ClaimEvidence[];
  providerName: string;
}

export function EvidenceDrawer({ claims, providerName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<EvidenceType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClaims = claims.filter((claim) => {
    if (filterType !== "ALL" && claim.evidence_type !== filterType) {
      return false;
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return (
        claim.claim.toLowerCase().includes(q) ||
        claim.verbatim_quote.toLowerCase().includes(q) ||
        claim.source_title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    ALL: claims.length,
    DOC_BACKED: claims.filter((c) => c.evidence_type === "DOC_BACKED").length,
    PORTAL_OBSERVED: claims.filter((c) => c.evidence_type === "PORTAL_OBSERVED").length,
    ESTIMATE: claims.filter((c) => c.evidence_type === "ESTIMATE").length,
    "UNSPECIFIED IN DOCS": claims.filter((c) => c.evidence_type === "UNSPECIFIED IN DOCS").length,
  };

  return (
    <>
      {/* Sticky Trigger Banner / Button in Guide Page */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Evidence-Backed Documentation Ledger
            </h4>
            <p className="text-xs text-neutral-400">
              {claims.length} claims verified with verbatim quotes and direct official documentation citations.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 text-xs font-semibold transition-colors"
        >
          <span>Open Evidence Drawer</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Slide-over Drawer Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-2xl border-l border-neutral-800 bg-neutral-950 p-6 shadow-2xl flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Audit Ledger
                    </span>
                    <span className="rounded bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-300">
                      {providerName}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Claims & Evidence Registry
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Inspect verbatim supporting snippets and official documentation links for all claims.
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Filters & Search Bar */}
              <div className="py-4 space-y-3 border-b border-neutral-800/80">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search claims, quotes, or source titles..."
                    className="w-full rounded-lg bg-neutral-900 border border-neutral-800 pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <button
                    onClick={() => setFilterType("ALL")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      filterType === "ALL"
                        ? "bg-neutral-100 text-neutral-900 font-semibold"
                        : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                    }`}
                  >
                    All ({counts.ALL})
                  </button>
                  <button
                    onClick={() => setFilterType("DOC_BACKED")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      filterType === "DOC_BACKED"
                        ? "bg-emerald-500 text-black font-semibold"
                        : "bg-neutral-900 text-emerald-400 hover:bg-neutral-800"
                    }`}
                  >
                    Doc-Backed ({counts.DOC_BACKED})
                  </button>
                  {counts.PORTAL_OBSERVED > 0 && (
                    <button
                      onClick={() => setFilterType("PORTAL_OBSERVED")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        filterType === "PORTAL_OBSERVED"
                          ? "bg-sky-500 text-black font-semibold"
                          : "bg-neutral-900 text-sky-400 hover:bg-neutral-800"
                      }`}
                    >
                      Portal ({counts.PORTAL_OBSERVED})
                    </button>
                  )}
                  {counts.ESTIMATE > 0 && (
                    <button
                      onClick={() => setFilterType("ESTIMATE")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        filterType === "ESTIMATE"
                          ? "bg-amber-500 text-black font-semibold"
                          : "bg-neutral-900 text-amber-400 hover:bg-neutral-800"
                      }`}
                    >
                      Estimate ({counts.ESTIMATE})
                    </button>
                  )}
                  {counts["UNSPECIFIED IN DOCS"] > 0 && (
                    <button
                      onClick={() => setFilterType("UNSPECIFIED IN DOCS")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        filterType === "UNSPECIFIED IN DOCS"
                          ? "bg-neutral-700 text-white font-semibold"
                          : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                      }`}
                    >
                      Unspecified ({counts["UNSPECIFIED IN DOCS"]})
                    </button>
                  )}
                </div>
              </div>

              {/* Claims List Scrollable */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {filteredClaims.length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-500">
                    No claims match your search query or filter.
                  </div>
                ) : (
                  filteredClaims.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3 hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h5 className="text-xs font-semibold text-white leading-relaxed">
                          {item.claim}
                        </h5>
                        <div className="shrink-0">
                          <EvidenceBadge type={item.evidence_type} />
                        </div>
                      </div>

                      {item.verbatim_quote && (
                        <div className="rounded-lg bg-neutral-950/80 border border-neutral-800 p-3 flex items-start gap-2.5 text-xs text-neutral-300">
                          <Quote className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <p className="italic leading-relaxed">
                            &ldquo;{item.verbatim_quote}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-neutral-400 gap-2 pt-1 border-t border-neutral-800/60">
                        <span className="font-medium text-neutral-400 truncate">
                          Source: {item.source_title}
                        </span>
                        {item.source_url && (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:underline shrink-0"
                          >
                            <span>Verify Source URL</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                <span>Deterministic claim validation active</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
