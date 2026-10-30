import { NextRequest, NextResponse } from "next/server";
import { saveResearchRun } from "@/lib/db";
import { runResearchPipeline } from "@/lib/agent/pipeline";
import { validateSafeUrl, SecurityError } from "@/lib/security/ssrf";
import { ResearchRun } from "@/types/guide";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input } = body;

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json(
        { error: "Application name or documentation URL is required." },
        { status: 400 }
      );
    }

    const trimmedInput = input.trim();

    // If it's a URL, perform upfront SSRF validation
    if (trimmedInput.startsWith("http://") || trimmedInput.startsWith("https://")) {
      try {
        await validateSafeUrl(trimmedInput);
      } catch (err) {
        if (err instanceof SecurityError) {
          return NextResponse.json(
            { error: `Security check failed: ${err.message}` },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: `Invalid URL: ${(err as Error).message}` },
          { status: 400 }
        );
      }
    }

    const runId = crypto.randomUUID();
    const initialRun: ResearchRun = {
      run_id: runId,
      app_input: trimmedInput,
      status: "running",
      stages: [
        {
          stage: "discover",
          name: "Discovering Documentation",
          status: "running",
          message: `Discovering developer documentation for "${trimmedInput}"...`,
        },
        {
          stage: "extract",
          name: "Extracting Requirements",
          status: "pending",
          message: "Awaiting source discovery...",
        },
        {
          stage: "investigate",
          name: "Investigating Approval & Readiness",
          status: "pending",
          message: "Awaiting extraction...",
        },
        {
          stage: "validate",
          name: "Validating Evidence",
          status: "pending",
          message: "Awaiting analysis...",
        },
        {
          stage: "generate",
          name: "Generating Structured Guide",
          status: "pending",
          message: "Awaiting validation...",
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await saveResearchRun(initialRun);

    // Kick off research pipeline asynchronously in background
    runResearchPipeline(runId, trimmedInput).catch((err) => {
      console.error(`Unhandled pipeline error for run ${runId}:`, err);
    });

    return NextResponse.json({ runId }, { status: 202 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to initiate research run." },
      { status: 500 }
    );
  }
}
