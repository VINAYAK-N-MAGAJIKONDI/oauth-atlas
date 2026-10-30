"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ResearchRun, ResearchStageState } from "@/types/guide";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  X,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialInput?: string;
}

export function ResearchAgentModal({ isOpen, onClose, initialInput = "" }: Props) {
  const router = useRouter();
  const [input, setInput] = useState(initialInput);
  const [runId, setRunId] = useState<string | null>(null);
  const [runState, setRunState] = useState<ResearchRun | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
    }
  }, [initialInput]);

  // Poll for live research progress
  useEffect(() => {
    if (!runId || (runState && (runState.status === "completed" || runState.status === "failed"))) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/research/${runId}`);
        if (res.ok) {
          const data: ResearchRun = await res.json();
          setRunState(data);

          if (data.status === "completed" && data.generated_slug) {
            clearInterval(interval);
          } else if (data.status === "failed") {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.warn("Polling error:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [runId, runState]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setRunState(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to start research run.");
        setIsSubmitting(false);
        return;
      }

      setRunId(data.runId);
      setIsSubmitting(false);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleOpenGuide = () => {
    if (runState?.generated_slug) {
      onClose();
      router.push(`/guides/${runState.generated_slug}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Live AI Research Agent
              </h3>
              <p className="text-xs text-neutral-400">
                5-phase deterministic investigation pipeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Form if not yet submitted or if retrying */}
        {!runId && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Application Name or Developer Documentation URL
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Notion, Linear, HubSpot, or https://developers.notion.com/..."
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                autoFocus
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-red-950/30 border border-red-500/30 p-3.5 flex items-start gap-2.5 text-xs text-red-300">
                <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-200">Investigation Error</p>
                  <p className="mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <span>Examples:</span>
                <button
                  type="button"
                  onClick={() => setInput("Notion")}
                  className="hover:text-emerald-400 underline underline-offset-2"
                >
                  Notion
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setInput("Linear")}
                  className="hover:text-emerald-400 underline underline-offset-2"
                >
                  Linear
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setInput("HubSpot")}
                  className="hover:text-emerald-400 underline underline-offset-2"
                >
                  HubSpot
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !input.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-4 py-2 text-xs font-semibold disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Initiating...</span>
                  </>
                ) : (
                  <>
                    <span>Investigate Application</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Live Stage-by-Stage Progress UI */}
        {runId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800">
              <span className="text-neutral-400">
                Target: <strong className="text-white">{runState?.app_input || input}</strong>
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  runState?.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : runState?.status === "failed"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                }`}
              >
                {runState?.status === "completed"
                  ? "Completed"
                  : runState?.status === "failed"
                  ? "Failed"
                  : "Investigating..."}
              </span>
            </div>

            {/* Stages Stack */}
            <div className="space-y-2.5">
              {runState?.stages.map((stage: ResearchStageState, idx: number) => {
                const isRunning = stage.status === "running";
                const isCompleted = stage.status === "completed";
                const isFailed = stage.status === "failed";
                const isPending = stage.status === "pending";

                return (
                  <div
                    key={stage.stage || idx}
                    className={`rounded-xl border p-3 transition-colors ${
                      isRunning
                        ? "border-sky-500/40 bg-sky-950/20"
                        : isCompleted
                        ? "border-emerald-500/20 bg-emerald-950/10"
                        : isFailed
                        ? "border-red-500/30 bg-red-950/20"
                        : "border-neutral-800/80 bg-neutral-900/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {isRunning && <Loader2 className="h-4 w-4 animate-spin text-sky-400" />}
                          {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                          {isFailed && <XCircle className="h-4 w-4 text-red-400" />}
                          {isPending && <Clock className="h-4 w-4 text-neutral-500" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              Stage {idx + 1}: {stage.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                            {stage.message}
                          </p>

                          {/* Sources list if found */}
                          {stage.sources_found && stage.sources_found.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {stage.sources_found.slice(0, 3).map((s, sIdx) => (
                                <a
                                  key={sIdx}
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[10px] text-sky-400 hover:underline truncate"
                                >
                                  <span>• {s.title}</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-neutral-500 uppercase">
                        {stage.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error Message if run failed */}
            {runState?.status === "failed" && (
              <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-3.5 space-y-2 text-xs text-red-300">
                <div className="flex items-center gap-2 font-semibold text-red-200">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  <span>Research Run Could Not Complete</span>
                </div>
                <p className="leading-relaxed">
                  {runState.error || "An error occurred during discovery or extraction."}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRunId(null);
                      setRunState(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors"
                  >
                    Try Another App / Direct URL
                  </button>
                </div>
              </div>
            )}

            {/* Completion Action */}
            {runState?.status === "completed" && (
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Guide persisted and ready!
                </span>

                <button
                  onClick={handleOpenGuide}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-4 py-2 text-xs font-bold transition-colors shadow-lg"
                >
                  <span>Open Generated Guide</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
