import { NextRequest, NextResponse } from "next/server";
import { getResearchRun } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const run = await getResearchRun(runId);

    if (!run) {
      return NextResponse.json({ error: "Research run not found" }, { status: 404 });
    }

    return NextResponse.json(run);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to retrieve research run" },
      { status: 500 }
    );
  }
}
