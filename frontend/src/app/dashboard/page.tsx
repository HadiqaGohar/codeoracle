"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Clock,
  Trash2,
  ExternalLink,
  GitBranch,
  Code,
  Shield,
  Bug,
  Network,
  FileText,
  Wrench,
  AlertTriangle,
} from "lucide-react";

interface HistoryItem {
  url: string;
  repoName: string;
  timestamp: number;
  completedCount: number;
}

interface StorageStats {
  totalKeys: number;
  totalSize: number;
  analysesCount: number;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  code_explain: Code,
  bug_detection: Bug,
  readme_improve: FileText,
  architecture: Network,
  documentation: FileText,
  refactoring: Wrench,
  security: Shield,
  code_smells: AlertTriangle,
};

export default function DashboardPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<StorageStats>({ totalKeys: 0, totalSize: 0, analysesCount: 0 });
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = () => {
    try {
      const raw = localStorage.getItem("repo-analysis-history");
      if (raw) {
        const data = JSON.parse(raw);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const valid = data.filter((h: HistoryItem) => Date.now() - h.timestamp < sevenDays);
        setHistory(valid.sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp));
      }
    } catch {}
  };

  const loadStats = () => {
    let totalKeys = 0;
    let totalSize = 0;
    let analysesCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        totalKeys++;
        const val = localStorage.getItem(key) || "";
        totalSize += val.length;
        if (key.startsWith("repo-analysis-") && key !== "repo-analysis-history") {
          try {
            const data = JSON.parse(val);
            if (data.completed) analysesCount += data.completed.length;
          } catch {}
        }
      }
    }

    setStats({ totalKeys, totalSize, analysesCount });
  };

  const clearHistory = () => {
    localStorage.removeItem("repo-analysis-history");
    setHistory([]);
  };

  const clearAllCache = () => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("repo-analysis-")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setHistory([]);
    loadStats();
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const repoAnalyses = selectedRepo
    ? history.filter((h) => h.url === selectedRepo)
    : [];

  const uniqueRepos = Array.from(new Set(history.map((h) => h.url))).map((url) => {
    const item = history.find((h) => h.url === url)!;
    return { url, name: item.repoName, count: history.filter((h) => h.url === url).length, lastUsed: item.timestamp };
  });

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-zinc-500">Analytics, history, and usage overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{uniqueRepos.length}</div>
                <div className="text-xs text-zinc-500">Repos Analyzed</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.analysesCount}</div>
                <div className="text-xs text-zinc-500">Total Analyses</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{history.length}</div>
                <div className="text-xs text-zinc-500">History Items (7d)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Local Storage</div>
            <div className="text-lg font-bold text-white">{stats.totalKeys} keys</div>
            <div className="text-xs text-zinc-600">{formatSize(stats.totalSize)} used</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Unique Repos</div>
            <div className="text-lg font-bold text-white">{uniqueRepos.length}</div>
            <div className="text-xs text-zinc-600">Last 7 days</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Avg. Analyses/Repo</div>
            <div className="text-lg font-bold text-white">
              {uniqueRepos.length > 0 ? Math.round(stats.analysesCount / uniqueRepos.length) : 0}
            </div>
            <div className="text-xs text-zinc-600">per repository</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-white">Recent Repos</h3>
                <button
                  onClick={clearHistory}
                  className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {uniqueRepos.length === 0 ? (
                  <div className="p-6 text-center">
                    <GitBranch className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-xs text-zinc-500">No history yet</p>
                    <Link href="/analyze" className="text-xs text-violet-400 hover:text-violet-300">
                      Analyze a repo →
                    </Link>
                  </div>
                ) : (
                  uniqueRepos.map((repo) => (
                    <button
                      key={repo.url}
                      onClick={() => setSelectedRepo(selectedRepo === repo.url ? null : repo.url)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-zinc-800/50 ${
                        selectedRepo === repo.url
                          ? "bg-violet-600/10 border-l-2 border-l-violet-500"
                          : "hover:bg-zinc-800/50"
                      }`}
                    >
                      <GitBranch className="w-4 h-4 text-zinc-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-zinc-300 truncate">{repo.name}</div>
                        <div className="text-[10px] text-zinc-600">
                          {repo.count} analyses · {formatTime(repo.lastUsed)}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-white">
                  {selectedRepo ? `Analysis History` : "All History"}
                </h3>
                <div className="flex items-center gap-2">
                  {selectedRepo && (
                    <button
                      onClick={() => setSelectedRepo(null)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300"
                    >
                      Show All
                    </button>
                  )}
                  <button
                    onClick={clearAllCache}
                    className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {(selectedRepo ? repoAnalyses : history).length === 0 ? (
                  <div className="p-8 text-center">
                    <BarChart3 className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-xs text-zinc-500">No analyses recorded</p>
                  </div>
                ) : (
                  (selectedRepo ? repoAnalyses : history).map((item, i) => {
                    const Icon = GitBranch;
                    return (
                      <div
                        key={`${item.url}-${item.timestamp}-${i}`}
                        className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-zinc-300 truncate">{item.repoName}</div>
                          <div className="text-[10px] text-zinc-600">
                            {item.completedCount} analyses · {formatTime(item.timestamp)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {Array.from({ length: Math.min(item.completedCount, 5) }).map((_, j) => (
                              <div
                                key={j}
                                className="w-2 h-2 rounded-full bg-violet-500 border border-zinc-900"
                              />
                            ))}
                          </div>
                          <Link
                            href={`/analyze?url=${encodeURIComponent(item.url)}&tab=code_explain`}
                            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Open"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
