"use client";

import Link from "next/link";
import { Compass, ExternalLink, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 py-12 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Compass className="h-4 w-4 text-emerald-400" />
              <span>OAuth Atlas</span>
            </div>
            <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
              Empowering engineers and technical founders to understand OAuth requirements,
              verification tiers, CASA security audits, and agent automation before writing a single line of integration code.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-neutral-400">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>All claims backed by official documentation citations. No hallucinated deadlines.</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-3">
              Prebuilt Seed Guides
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/guides/github" className="hover:text-emerald-400 transition-colors">
                  GitHub OAuth Apps
                </Link>
              </li>
              <li>
                <Link href="/guides/slack" className="hover:text-emerald-400 transition-colors">
                  Slack OAuth v2
                </Link>
              </li>
              <li>
                <Link href="/guides/google-drive" className="hover:text-emerald-400 transition-colors">
                  Google Drive & Workspace
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-3">
              Explore & Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/compare" className="hover:text-emerald-400 transition-colors">
                  Provider Comparison Matrix
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-emerald-400 transition-colors">
                  Evidence Standards
                </Link>
              </li>
              <li>
                <a
                  href="https://developers.google.com/identity/protocols/oauth2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  OAuth 2.0 RFC 6749
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© 2026 OAuth Atlas. Built with Next.js, TypeScript, and Gemini.</p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live AI Research Pipeline Ready
          </p>
        </div>
      </div>
    </footer>
  );
}
