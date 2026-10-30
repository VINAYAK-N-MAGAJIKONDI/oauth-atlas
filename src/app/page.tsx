"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Guide } from "@/types/guide";
import { ResearchAgentModal } from "@/components/ResearchAgentModal";
import {
  Compass,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  AlertTriangle,
  GitBranch,
  MessageSquare,
  HardDrive,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGuides() {
      try {
        const res = await fetch("/api/guides");
        if (res.ok) {
          const data = await res.json();
          setGuides(data);
        }
      } catch (err) {
        console.warn("Failed to load guides:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGuides();
  }, []);

  const handleInvestigateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if query exactly matches an existing guide
    const match = guides.find(
      (g) =>
        g.slug.toLowerCase() === searchQuery.trim().toLowerCase() ||
        g.provider_name.toLowerCase() === searchQuery.trim().toLowerCase()
    );

    if (match) {
      window.location.href = `/guides/${match.slug}`;
      return;
    }

    setModalInput(searchQuery.trim());
    setIsModalOpen(true);
  };

  const handleQuickInvestigate = (name: string) => {
    setModalInput(name);
    setIsModalOpen(true);
  };

  // Filter guides
  const filteredGuides = guides.filter((guide) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      guide.provider_name.toLowerCase().includes(q) ||
      guide.description.toLowerCase().includes(q) ||
      guide.slug.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "ALL" || guide.category.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const getProviderIcon = (slug: string) => {
    switch (slug) {
      case "github":
        return (
          <svg className="h-5 w-5 fill-current text-neutral-200" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        );
      case "slack":
        return <MessageSquare className="h-5 w-5 text-[#E01E5A]" />;
      case "google-drive":
        return <HardDrive className="h-5 w-5 text-[#4285F4]" />;
      default:
        return <Compass className="h-5 w-5 text-emerald-400" />;
    }
  };

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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-800/80 bg-radial-[circle_at_top,_var(--tw-gradient-stops)] from-neutral-900/50 via-neutral-950 to-neutral-950 pt-20 pb-24">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>AI-Powered Setup & Approval Readiness Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
            Know the OAuth approval process{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              before you build.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Explore verified setup guides, understand provider requirements, and discover what it
            takes to move an integration from prototype to production.
          </p>

          {/* Search / Investigation Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <form
              onSubmit={handleInvestigateSubmit}
              className="relative flex items-center rounded-2xl border border-neutral-700 bg-neutral-900/90 shadow-2xl p-1.5 focus-within:border-emerald-500/70 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
            >
              <div className="pl-3.5 text-neutral-500">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search an application or paste its developer documentation URL..."
                className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-4 py-2.5 text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Investigate</span>
              </button>
            </form>

            {/* Quick Example Suggestions */}
            <div className="flex items-center justify-center gap-2 pt-3 text-xs text-neutral-400 flex-wrap">
              <span className="text-neutral-500">Popular investigations:</span>
              <button
                onClick={() => handleQuickInvestigate("Notion")}
                className="rounded-md bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-neutral-300 hover:border-emerald-500/40 hover:text-white transition-colors"
              >
                Notion
              </button>
              <button
                onClick={() => handleQuickInvestigate("Linear")}
                className="rounded-md bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-neutral-300 hover:border-emerald-500/40 hover:text-white transition-colors"
              >
                Linear
              </button>
              <button
                onClick={() => handleQuickInvestigate("HubSpot")}
                className="rounded-md bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-neutral-300 hover:border-emerald-500/40 hover:text-white transition-colors"
              >
                HubSpot
              </button>
              <button
                onClick={() =>
                  handleQuickInvestigate("https://developers.notion.com/docs/authorization")
                }
                className="rounded-md bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-neutral-300 hover:border-emerald-500/40 hover:text-white transition-colors truncate max-w-[200px]"
              >
                developers.notion.com...
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" />
              Provider Launch Playbooks
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Deeply researched launch guides with dynamic scope risk auditor and evidence ledger.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">
              Showing {filteredGuides.length} of {guides.length} providers
            </span>
          </div>
        </div>

        {/* Directory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {filteredGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 hover:border-neutral-700 hover:bg-neutral-900/70 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 group-hover:scale-105 transition-transform">
                    {getProviderIcon(guide.slug)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {guide.provider_name}
                    </h3>
                    <span className="text-xs text-neutral-400 font-mono">
                      {guide.official_domain}
                    </span>
                  </div>
                </div>

                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getComplexityBadge(
                    guide.complexity
                  )}`}
                >
                  {guide.complexity} Complexity
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2 mb-4 flex-1">
                {guide.description}
              </p>

              {/* Readiness Summary */}
              <div className="rounded-xl bg-neutral-950/70 border border-neutral-800/80 p-3 mb-4 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5 font-medium text-neutral-300 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Launch Readiness:</span>
                </div>
                <p className="line-clamp-2 leading-relaxed text-[11px]">
                  {guide.readiness_summary}
                </p>
              </div>

              {/* Stats & Link Footer */}
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-neutral-500" />
                    {guide.custom_oauth.setup_steps.length} Steps
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-neutral-500" />
                    {guide.scopes.length} Scopes
                  </span>
                </div>

                <div className="flex items-center gap-1 text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">
                  <span>View Playbook</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredGuides.length === 0 && !isLoading && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-12 text-center space-y-4 my-8">
            <Compass className="h-8 w-8 text-neutral-500 mx-auto" />
            <div>
              <h4 className="text-base font-semibold text-white">No prebuilt guide found</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                We couldn&apos;t find a prebuilt guide matching &ldquo;{searchQuery}&rdquo;. Launch our live AI research agent to investigate it now!
              </p>
            </div>
            <button
              onClick={() => handleQuickInvestigate(searchQuery)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-4 py-2 text-xs font-bold transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Investigate &ldquo;{searchQuery}&rdquo; with AI Agent</span>
            </button>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-neutral-800/80 bg-neutral-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Transforming fragmented documentation into evidence-backed launch playbooks
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Before committing engineering sprints, understand active setup time vs external provider review queues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-3 relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-white font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-semibold text-white">Find or Research Provider</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Choose a prebuilt provider guide or enter any SaaS application name or documentation URL into our live AI research pipeline.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-3 relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-white font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-semibold text-white">Audit Scopes & Approval Risk</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Select your required scopes and watch our rules engine dynamically calculate review tiers, CASA security assessment triggers, and architectural alternatives.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-3 relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-white font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-semibold text-white">Execute Launch Playbook</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Follow sequential setup steps with distinct responsibility badges: see what your AI agents can automate and what requires authenticated human action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Evidence Standards Section */}
      <section className="py-20 border-t border-neutral-800 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 sm:p-12">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Product Differentiation</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Deterministic evidence verification. Zero hallucinated deadlines.
              </h2>

              <p className="text-sm text-neutral-400 leading-relaxed">
                Traditional AI tools invent review durations and fees when sources are silent. OAuth Atlas strictly separates doc-backed facts from estimates and marks undocumented items explicitly:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                      DOC-BACKED
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Backed by verbatim quotes extracted directly from official developer documentation pages.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[11px] font-semibold text-sky-400">
                      PORTAL-OBSERVED
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Observed directly within provider developer consoles (e.g. Google Cloud, Slack App Management).
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
                      ESTIMATE
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Explicitly marked as an engineering estimate when providers publish no formal service level agreement.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-neutral-800 border border-neutral-700 px-2 py-0.5 text-[11px] font-semibold text-neutral-400">
                      UNSPECIFIED IN DOCS
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Preserves missing or ambiguous provider policies rather than fabricating answers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Agent Modal */}
      <ResearchAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialInput={modalInput}
      />
    </div>
  );
}
