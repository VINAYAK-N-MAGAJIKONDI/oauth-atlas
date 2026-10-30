export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getAllGuides } from "@/lib/db";
import { CompareClient } from "./CompareClient";
import { GitCompare, Loader2 } from "lucide-react";

export default async function ComparePage() {
  const allGuides = await getAllGuides();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-400 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            <span>Loading provider matrix...</span>
          </div>
        </div>
      }
    >
      <CompareClient allGuides={allGuides} />
    </Suspense>
  );
}
