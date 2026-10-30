import { EvidenceType } from "@/types/guide";
import { CheckCircle2, Eye, HelpCircle, AlertTriangle } from "lucide-react";

interface Props {
  type: EvidenceType;
  className?: string;
  showIcon?: boolean;
}

export function EvidenceBadge({ type, className = "", showIcon = true }: Props) {
  switch (type) {
    case "DOC_BACKED":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}
          title="Verified against official developer documentation"
        >
          {showIcon && <CheckCircle2 className="h-3 w-3" />}
          DOC-BACKED
        </span>
      );
    case "PORTAL_OBSERVED":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 ${className}`}
          title="Observed directly in developer console / portal"
        >
          {showIcon && <Eye className="h-3 w-3" />}
          PORTAL-OBSERVED
        </span>
      );
    case "ESTIMATE":
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}
          title="Industry estimate based on typical developer workflows"
        >
          {showIcon && <AlertTriangle className="h-3 w-3" />}
          ESTIMATE
        </span>
      );
    case "UNSPECIFIED IN DOCS":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-neutral-800 text-neutral-400 border border-neutral-700 ${className}`}
          title="Not explicitly documented or published by provider"
        >
          {showIcon && <HelpCircle className="h-3 w-3" />}
          UNSPECIFIED IN DOCS
        </span>
      );
  }
}
