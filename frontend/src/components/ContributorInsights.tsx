"use client";

import { useState, useEffect } from "react";
import { fetchTimeline, TimelineData } from "@/lib/api";
import { Users, AlertTriangle, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface ContributorInsightsProps {
  repoUrl: string;
}

interface BusFactor {
  bus_factor: number;
  risk_level: "critical" | "high" | "medium" | "low" | "unknown";
  total_commits: number;
  total_contributors: number;
  top_contributors: { login: string; avatar_url: string; total_commits: number; percentage: number }[];
}

export default function ContributorInsights({ repoUrl }: ContributorInsightsProps) {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTimeline(repoUrl)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [repoUrl]);

  if (loading) {
    return (
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-zinc-800 rounded w-1/3" />
          <div className="h-20 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  if (!data || !data.bus_factor) return null;

  const bf = data.bus_factor;

  const riskConfig = {
    critical: { color: "#ef4444", bg: "#ef444420", icon: ShieldAlert, label: "Critical Risk" },
    high: { color: "#f59e0b", bg: "#f59e0b20", icon: ShieldAlert, label: "High Risk" },
    medium: { color: "#3b82f6", bg: "#3b82f620", icon: Shield, label: "Medium Risk" },
    low: { color: "#22c55e", bg: "#22c55e20", icon: ShieldCheck, label: "Low Risk" },
    unknown: { color: "#6b7280", bg: "#6b728020", icon: Shield, label: "Unknown" },
  };

  const risk = riskConfig[bf.risk_level] || riskConfig.unknown;
  const RiskIcon = risk.icon;

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
        <Users className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Contributor Insights</h3>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: risk.bg }}
          >
            <RiskIcon className="w-5 h-5 mx-auto mb-1" style={{ color: risk.color }} />
            <div className="text-lg font-bold" style={{ color: risk.color }}>
              {bf.bus_factor}
            </div>
            <div className="text-[10px] text-zinc-400">Bus Factor</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{bf.total_contributors}</div>
            <div className="text-[10px] text-zinc-500">Contributors</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{bf.total_commits}</div>
            <div className="text-[10px] text-zinc-500">Total Commits</div>
          </div>
        </div>

        {bf.risk_level === "critical" && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <div className="text-xs text-red-300">
              <p className="font-medium mb-1">High Bus Factor Risk</p>
              <p className="text-red-400/80">
                This project relies heavily on {bf.top_contributors[0]?.login || "one contributor"}.
                If they leave, the project could be at risk. Consider onboarding more contributors.
              </p>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-xs text-zinc-400 mb-2 font-medium">Top Contributors</h4>
          <div className="space-y-2">
            {bf.top_contributors.map((c) => (
              <div key={c.login} className="flex items-center gap-2">
                <img src={c.avatar_url} alt={c.login} className="w-6 h-6 rounded-full" />
                <span className="text-xs text-zinc-300 flex-1 truncate">{c.login}</span>
                <span className="text-[10px] text-zinc-500">{c.total_commits}</span>
                <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${c.percentage}%`,
                      backgroundColor: c.percentage > 50 ? "#ef4444" : c.percentage > 30 ? "#f59e0b" : "#22c55e",
                    }}
                  />
                </div>
                <span className="text-[10px] text-zinc-600 w-10 text-right">{c.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {data.code_frequency && data.code_frequency.length > 0 && (
          <div>
            <h4 className="text-xs text-zinc-400 mb-2 font-medium">Recent Activity (12 weeks)</h4>
            <div className="flex items-end gap-0.5 h-12">
              {data.code_frequency.map((f, i) => {
                const total = Math.abs(f.additions) + Math.abs(f.deletions);
                const maxHeight = 48;
                const maxVal = Math.max(...data.code_frequency.map((x) => Math.abs(x.additions) + Math.abs(x.deletions)), 1);
                const height = Math.max((total / maxVal) * maxHeight, 2);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className="w-full rounded-sm"
                      style={{
                        height: `${height}px`,
                        backgroundColor: f.additions > Math.abs(f.deletions) ? "#22c55e80" : "#ef444480",
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[8px] text-zinc-600">+additions</span>
              <span className="text-[8px] text-zinc-600">-deletions</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
