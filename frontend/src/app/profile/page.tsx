"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, LogOut, History, BarChart3, Settings, GitBranch, Loader2, ExternalLink } from "lucide-react";
import { getHistory } from "@/components/HistoryPanel";

interface HistoryItem {
  url: string;
  repoName: string;
  timestamp: number;
  completedCount: number;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  const totalAnalyses = history.reduce((sum, item) => sum + item.completedCount, 0);
  const uniqueRepos = new Set(history.map((h) => h.url)).size;

  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="relative">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-zinc-700"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">
                {user.name || "Anonymous User"}
              </h1>
              <p className="text-zinc-500 text-sm mb-4">{user.email}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                  <span><span className="text-white font-semibold">{totalAnalyses}</span> analyses</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <GitBranch className="w-4 h-4 text-violet-400" />
                  <span><span className="text-white font-semibold">{uniqueRepos}</span> repos</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-1">
              {totalAnalyses}
            </div>
            <div className="text-zinc-500 text-sm">Total Analyses</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-1">
              {uniqueRepos}
            </div>
            <div className="text-zinc-500 text-sm">Repos Analyzed</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-1">
              7
            </div>
            <div className="text-zinc-500 text-sm">Analysis Types</div>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <History className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Recent Analyses</h2>
          </div>
          {history.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <GitBranch className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No analyses yet. Start by pasting a GitHub URL!</p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-500 transition-colors"
              >
                Analyze a Repo
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {history.map((item) => (
                <div
                  key={item.url}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-zinc-800/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/analyze?url=${encodeURIComponent(item.url)}`)}
                >
                  <GitBranch className="w-5 h-5 text-zinc-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{item.repoName}</div>
                    <div className="text-xs text-zinc-600 truncate">{item.url}</div>
                  </div>
                  <div className="text-xs text-zinc-500 shrink-0">
                    {item.completedCount}/7
                  </div>
                  <div className="text-xs text-zinc-600 shrink-0">
                    {formatTimeAgo(item.timestamp)}
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-600 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
