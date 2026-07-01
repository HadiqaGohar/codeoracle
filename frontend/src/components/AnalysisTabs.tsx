"use client";

import { AnalysisType, ANALYSIS_LABELS } from "@/types";
import {
  Code,
  Bug,
  FileText,
  Network,
  BookOpen,
  Wrench,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<AnalysisType, React.ElementType> = {
  code_explain: Code,
  bug_detection: Bug,
  readme_improve: FileText,
  architecture: Network,
  documentation: BookOpen,
  refactoring: Wrench,
  security: Shield,
};

interface AnalysisTabsProps {
  activeTab: AnalysisType;
  onTabChange: (type: AnalysisType) => void;
  completedAnalyses: Set<AnalysisType>;
}

export default function AnalysisTabs({
  activeTab,
  onTabChange,
  completedAnalyses,
}: AnalysisTabsProps) {
  const tabs: AnalysisType[] = [
    "code_explain",
    "bug_detection",
    "readme_improve",
    "architecture",
    "documentation",
    "refactoring",
    "security",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const Icon = ICONS[tab];
        const isActive = activeTab === tab;
        const isCompleted = completedAnalyses.has(tab);

        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              isActive
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
              isCompleted && !isActive && "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{ANALYSIS_LABELS[tab]}</span>
            <span className="sm:hidden">{ANALYSIS_LABELS[tab].split(" ")[0]}</span>
            {isCompleted && !isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
