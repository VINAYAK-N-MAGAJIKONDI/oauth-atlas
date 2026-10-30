"use client";

import { useState } from "react";
import { Guide, ScopeItem } from "@/types/guide";
import { Copy, Check, FileCode, FileText, AlertCircle, Sparkles } from "lucide-react";
import YAML from "yaml";

interface Props {
  guide: Guide;
  selectedScopes?: ScopeItem[];
}

export function ArtifactModal({ guide, selectedScopes }: Props) {
  const [activeTab, setActiveTab] = useState<"slack_manifest" | "google_justification">(
    guide.slug === "slack" ? "slack_manifest" : "google_justification"
  );
  const [copied, setCopied] = useState(false);

  const activeScopes = selectedScopes && selectedScopes.length > 0 ? selectedScopes : guide.scopes;
  const isSlack = guide.slug === "slack";
  const isGoogle = guide.slug === "google-drive" || guide.provider_name.toLowerCase().includes("google");

  // Generate Slack App Manifest YAML
  const generateSlackManifest = () => {
    const botScopes = activeScopes
      .filter((s) => !s.name.startsWith("user_") && s.risk_tier !== "restricted")
      .map((s) => s.name);

    const userScopes = activeScopes
      .filter((s) => s.name.startsWith("user_"))
      .map((s) => s.name);

    const manifestObj = {
      _metadata: {
        major_version: 1,
        minor_version: 1,
      },
      display_information: {
        name: "My OAuth App",
        description: guide.description.substring(0, 120),
        background_color: "#1e1e2e",
      },
      features: {
        bot_user: {
          display_name: "Assistant Bot",
          always_online: false,
        },
      },
      oauth_config: {
        redirect_urls: [
          "https://yourdomain.com/api/auth/callback/slack",
          "http://localhost:3000/api/auth/callback/slack",
        ],
        scopes: {
          bot: botScopes.length > 0 ? botScopes : ["chat:write", "channels:read"],
          ...(userScopes.length > 0 ? { user: userScopes } : {}),
        },
      },
      settings: {
        org_deploy_enabled: false,
        socket_mode_enabled: false,
        token_rotation_enabled: false,
      },
    };

    return YAML.stringify(manifestObj);
  };

  // Generate Google Scope Justification Draft
  const generateGoogleJustification = () => {
    const requestedScopesText = activeScopes
      .map(
        (s) =>
          `• Scope: ${s.name} (${s.risk_tier.toUpperCase()})\n  Justification: Required to allow users to ${s.description.toLowerCase()}. Narrower permissions are insufficient because our integration requires accessing files explicitly chosen by the user within our application workflow.`
      )
      .join("\n\n");

    return `GOOGLE OAUTH APP VERIFICATION — SCOPE JUSTIFICATION DRAFT
============================================================
Application Name: My OAuth Atlas Integration
Client ID: [YOUR_GOOGLE_CLIENT_ID].apps.googleusercontent.com
Authorized Domain: yourdomain.com
Privacy Policy URL: https://yourdomain.com/privacy
Terms of Service URL: https://yourdomain.com/terms
YouTube Demo Video URL: https://youtu.be/[YOUR_UNLISTED_DEMO_ID]

1. APPLICATION PURPOSE:
Our application provides automated document organization and collaboration tools for teams. Users authorize our app to seamlessly synchronize and save their project documents to Google Drive.

2. REQUESTED SCOPES & ARCHITECTURAL JUSTIFICATION:
${requestedScopesText}

3. EXPLANATION OF MINIMUM PRIVILEGE:
We adhere strictly to the Principle of Least Privilege. Our backend does not store Google credentials on client devices and limits API queries strictly to the files relevant to the active project session.

4. COMPLIANCE WITH GOOGLE LIMITED USE POLICY:
Our privacy policy explicitly affirms that our use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.
Data is never sold to third parties or used to serve advertisements.`;
  };

  const currentContent =
    activeTab === "slack_manifest" ? generateSlackManifest() : generateGoogleJustification();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white">
              Launch Artifact Generator
            </h4>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
              Agent-Automatable
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Generate ready-to-copy configuration manifests and verification submissions tailored to your selected scopes.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {isSlack && (
            <button
              onClick={() => setActiveTab("slack_manifest")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === "slack_manifest"
                  ? "bg-neutral-800 text-white border border-neutral-700"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Slack App Manifest (YAML)</span>
            </button>
          )}

          {isGoogle && (
            <button
              onClick={() => setActiveTab("google_justification")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === "google_justification"
                  ? "bg-neutral-800 text-white border border-neutral-700"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Google Scope Justification</span>
            </button>
          )}

          {!isSlack && !isGoogle && (
            <button
              onClick={() => setActiveTab("google_justification")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium bg-neutral-800 text-white"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Scope Justification Draft</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="absolute right-3 top-3 z-10">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white px-3 py-1.5 text-xs font-medium border border-neutral-700 transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Draft</span>
              </>
            )}
          </button>
        </div>

        <pre className="rounded-lg bg-neutral-950 border border-neutral-800/80 p-4 text-xs font-mono text-neutral-300 overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap">
          {currentContent}
        </pre>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-neutral-400 rounded-lg bg-neutral-950/40 p-3 border border-neutral-800/60">
        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-neutral-300">Human Review Required:</strong> This generated artifact is a compliant draft based on official guidelines. Review and customize your project details before submitting it to the provider console.
        </p>
      </div>
    </div>
  );
}
