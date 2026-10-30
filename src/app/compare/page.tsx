export const dynamic = "force-dynamic";

import { getAllGuides } from "@/lib/db";
import Link from "next/link";
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
} from "lucide-react";

export default async function ComparePage() {
  const guides = await getAllGuides();
  const prebuilt = guides.filter((g) =>
    ["github", "slack", "google-drive"].includes(g.slug)
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col pb-20 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <GitCompare className="h-3.5 w-3.5" />
            <span>Side-by-Side Architectural Matrix</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Provider OAuth & Approval Comparison
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Understand why OAuth authorization requirements and review waiting times differ radically across major developer platforms.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 flex-1 w-full space-y-8">
        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/80">
                <th className="p-4 sm:p-5 font-semibold text-neutral-400 w-1/4">
                  Evaluation Dimension
                </th>
                {prebuilt.map((p) => (
                  <th key={p.slug} className="p-4 sm:p-5 font-bold text-white w-1/4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{p.provider_name}</span>
                      <Link
                        href={`/guides/${p.slug}`}
                        className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium text-[11px]"
                      >
                        <span>Playbook</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-800/80">
              {/* Row 1: Registration Complexity */}
              <tr className="hover:bg-neutral-900/50">
                <td className="p-4 sm:p-5 font-semibold text-neutral-300">
                  App Registration Complexity
                </td>
                <td className="p-4 sm:p-5 text-neutral-300">
                  <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                    Low
                  </span>
                  <p className="mt-1 text-neutral-400 leading-relaxed">
                    Single-page developer form. Instant client ID and secret generation.
                  </p>
                </td>
                <td className="p-4 sm:p-5 text-neutral-300">
                  <span className="rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 text-[10px] font-semibold">
                    Moderate
                  </span>
                  <p className="mt-1 text-neutral-400 leading-relaxed">
                    App manifests (YAML/JSON) or portal UI. Separate bot vs user token scopes.
                  </p>
                </td>
                <td className="p-4 sm:p-5 text-neutral-300">
                  <span className="rounded bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 text-[10px] font-semibold">
                    Very High
                  </span>
                  <p className="mt-1 text-neutral-400 leading-relaxed">
                    GCP project setup, API activation, OAuth consent screen, Search Console domain verification.
                  </p>
                </td>
              </tr>

              {/* Row 2: Scope Sensitivity Model */}
              <tr className="hover:bg-neutral-900/50">
                <td className="p-4 sm:p-5 font-semibold text-neutral-300">
                  Scope Sensitivity Model
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  Granular scopes (`repo`, `read:user`), but all self-serve. No mandatory platform verification queue.
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  Bot scopes vs User scopes. Scrutinized by workspace admins; self-serve for direct OAuth install link.
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  Strict 3-tier model: Non-sensitive (`drive.file`), Sensitive (`drive.metadata.readonly`), and Restricted (`drive`, `drive.readonly`).
                </td>
              </tr>

              {/* Row 3: Development Setup Limits */}
              <tr className="hover:bg-neutral-900/50">
                <td className="p-4 sm:p-5 font-semibold text-neutral-300">
                  Development Mode Limits
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  Zero limits. Direct localhost testing. Any GitHub user can authorize.
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  1-click install to development workspace. Unlimited bot message testing.
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  Severe: Capped at 100 test accounts. External refresh tokens expire after 7 days in testing status.
                </td>
              </tr>

              {/* Row 4: Public Distribution Requirements */}
              <tr className="hover:bg-neutral-900/50">
                <td className="p-4 sm:p-5 font-semibold text-neutral-300">
                  Public Distribution Flow
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  Instant. Share authorization URL directly on your site.
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  Activate &ldquo;Public Distribution&rdquo; switch. Direct multi-workspace install link ready immediately.
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  Requires moving status to &ldquo;In production&rdquo;, triggering mandatory Google Trust & Safety review.
                </td>
              </tr>

              {/* Row 5: Provider Verification */}
              <tr className="hover:bg-neutral-900/50">
                <td className="p-4 sm:p-5 font-semibold text-neutral-300">
                  Mandatory Verification
                </td>
                <td className="p-4 sm:p-5 text-emerald-400 font-semibold">
                  None (0 verification required for OAuth)
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  None for direct links; Required only for official App Directory listing.
                </td>
                <td className="p-4 sm:p-5 text-red-400 font-semibold">
                  Mandatory for external users (Brand verification + CASA Tier 2/3 security assessment if restricted scopes).
                </td>
              </tr>

              {/* Row 6: External Review Waiting Time */}
              <tr className="hover:bg-neutral-900/50">
                <td className="p-4 sm:p-5 font-semibold text-neutral-300">
                  External Review Wait
                </td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">
                  0 days (Instant)
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  0 days (Direct install) / 2–4 weeks (App Directory)
                </td>
                <td className="p-4 sm:p-5 text-amber-400 font-bold">
                  3–5 days (Sensitive) / 4–8 weeks (Restricted CASA audit)
                </td>
              </tr>

              {/* Row 7: Direct Audit / Certification Costs */}
              <tr className="hover:bg-neutral-900/50">
                <td className="p-4 sm:p-5 font-semibold text-neutral-300">
                  Direct Audit Fees
                </td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">
                  $0 (Free)
                </td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">
                  $0 (Free)
                </td>
                <td className="p-4 sm:p-5 text-red-400 font-bold">
                  $0 for drive.file / $1,500 – $6,000+ paid to CASA lab for restricted scopes
                </td>
              </tr>

              {/* Row 8: Human Intervention Requirement */}
              <tr className="hover:bg-neutral-900/50">
                <td className="p-4 sm:p-5 font-semibold text-neutral-300">
                  Human Involvement
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  Register OAuth app in developer portal.
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  Toggle public distribution; workspace admin approvals.
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  DNS domain verification, record YouTube video screencast, contract CASA assessment lab.
                </td>
              </tr>

              {/* Row 9: Main Launch Blocker */}
              <tr className="hover:bg-neutral-900/50">
                <td className="p-4 sm:p-5 font-semibold text-neutral-300">
                  Primary Launch Blocker
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  Corporate GitHub Organization OAuth restriction policies.
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  Enterprise Slack admin &ldquo;App Approval&rdquo; policies.
                </td>
                <td className="p-4 sm:p-5 text-neutral-400">
                  7-day token expiration in testing & restricted scope verification delays.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
