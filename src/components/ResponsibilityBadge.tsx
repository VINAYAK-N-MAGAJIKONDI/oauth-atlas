import { ResponsibilityBadge as BadgeType } from "@/types/guide";
import { User, Bot, UserCheck } from "lucide-react";

interface Props {
  responsibility: BadgeType;
  className?: string;
}

export function ResponsibilityBadge({ responsibility, className = "" }: Props) {
  switch (responsibility) {
    case "HUMAN REQUIRED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 tracking-wider ${className}`}
        >
          <User className="h-3 w-3" />
          HUMAN REQUIRED
        </span>
      );
    case "AGENT AUTOMATABLE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider ${className}`}
        >
          <Bot className="h-3 w-3" />
          AGENT AUTOMATABLE
        </span>
      );
    case "HYBRID":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 tracking-wider ${className}`}
        >
          <UserCheck className="h-3 w-3" />
          HYBRID
        </span>
      );
  }
}
