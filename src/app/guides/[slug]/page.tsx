export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getGuideBySlug, getAllGuides } from "@/lib/db";
import { GuideDetailClient } from "@/components/GuideDetailClient";
import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 mx-auto">
            <Compass className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Guide &ldquo;{slug}&rdquo; Not Found</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            We haven&apos;t researched &ldquo;{slug}&rdquo; yet, or it hasn&apos;t been published. You can research this provider immediately with our live AI agent.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors"
            >
              Back to Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <GuideDetailClient guide={guide} />;
}
