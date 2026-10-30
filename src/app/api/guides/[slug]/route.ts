export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getGuideBySlug } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const guide = await getGuideBySlug(slug);

    if (!guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    return NextResponse.json(guide);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch guide" },
      { status: 500 }
    );
  }
}
