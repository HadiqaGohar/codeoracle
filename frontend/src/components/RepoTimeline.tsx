"use client";

import { useState, useEffect } from "react";
import { fetchTimeline, TimelineData } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { TrendingUp, Users, GitCommit } from "lucide-react";

interface RepoTimelineProps {
  repoUrl: string;
}

type TimeRange = "12w" | "26w" | "52w";

export default function RepoTimeline({ repoUrl }: RepoTimelineProps) {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<TimeRange>("12w");

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
          <div className="h-40 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const weekCount = range === "12w" ? 12 : range === "26w" ? 26 : 52;

  const commitData = data.commit_activity.slice(-weekCount).map((w, i) => ({
    week: `W${i + 1}`,
    commits: w.commits || 0,
  }));

  const participationData = data.participation.weekly_all.slice(-weekCount).map((val, i) => ({
    week: `W${i + 1}`,
    total: val,
    owner: data.participation.weekly_owner?.[i] || 0,
  }));

  const totalCommits = commitData.reduce((sum, w) => sum + w.commits, 0);
  const avgCommits = Math.round(totalCommits / Math.max(commitData.length, 1));

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Repo Timeline</h3>
        </div>
        <div className="flex gap-1">
          {(["12w", "26w", "52w"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-[10px] px-2 py-1 rounded ${
                range === r ? "bg-violet-600 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
            <GitCommit className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{totalCommits}</div>
            <div className="text-[10px] text-zinc-500">Total Commits</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
            <TrendingUp className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{avgCommits}</div>
            <div className="text-[10px] text-zinc-500">Avg/Week</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
            <Users className="w-4 h-4 text-violet-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{data.contributors.length}</div>
            <div className="text-[10px] text-zinc-500">Contributors</div>
          </div>
        </div>

        <div>
          <h4 className="text-xs text-zinc-400 mb-2 font-medium">Commit Activity</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commitData}>
                <XAxis dataKey="week" tick={false} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "#a1a1aa" }}
                  itemStyle={{ color: "#22c55e" }}
                />
                <Bar dataKey="commits" fill="#22c55e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {data.contributors.length > 0 && (
          <div>
            <h4 className="text-xs text-zinc-400 mb-2 font-medium">Top Contributors</h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {data.contributors.slice(0, 8).map((c) => (
                <div key={c.login} className="flex items-center gap-2">
                  <img
                    src={c.avatar_url}
                    alt={c.login}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-xs text-zinc-300 flex-1 truncate">{c.login}</span>
                  <span className="text-[10px] text-zinc-500">{c.total_commits} commits</span>
                  <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{
                        width: `${(c.total_commits / Math.max(data.contributors[0].total_commits, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
