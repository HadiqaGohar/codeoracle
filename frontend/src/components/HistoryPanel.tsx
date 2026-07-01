"use client";

import { useState, useEffect } from "react";
import { Clock, Trash2, ExternalLink } from "lucide-react";

interface HistoryItem {
  url: string;
  repoName: string;
  timestamp: number;
  completedCount: number;
}

const HISTORY_KEY = "repo-analysis-history";

function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    return items.filter((item: HistoryItem) => {
      const age = Date.now() - item.timestamp;
      return age < 7 * 24 * 60 * 60 * 1000;
    });
  } catch {
    return [];
  }
}

function saveToHistory(url: string, repoName: string, completedCount: number) {
  try {
    const history = getHistory();
    const existing = history.findIndex((h) => h.url === url);
    const item: HistoryItem = { url, repoName, timestamp: Date.now(), completedCount };

    if (existing >= 0) {
      history[existing] = item;
    } else {
      history.unshift(item);
    }

    const trimmed = history.slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch { /* storage unavailable */ }
}

function removeFromHistory(url: string) {
  try {
    const history = getHistory().filter((h) => h.url !== url);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* ignore */ }
}

function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch { /* ignore */ }
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

export default function HistoryPanel({
  onSelect,
}: {
  onSelect: (url: string) => void;
}) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromHistory(url);
    setHistory(getHistory());
  };

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors mx-auto"
      >
        <Clock className="w-4 h-4" />
        {isOpen ? "Hide" : "Show"} Recent Analyses ({history.length})
      </button>

      {isOpen && (
        <div className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-sm font-medium text-zinc-400">History</span>
            <button
              onClick={handleClear}
              className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {history.map((item) => (
              <button
                key={item.url}
                onClick={() => onSelect(item.url)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left group"
              >
                <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-zinc-300 truncate">{item.repoName}</div>
                  <div className="text-xs text-zinc-600 truncate">{item.url}</div>
                </div>
                <div className="text-xs text-zinc-600 shrink-0">
                  {item.completedCount}/7
                </div>
                <div className="text-xs text-zinc-600 shrink-0">
                  {formatTimeAgo(item.timestamp)}
                </div>
                <button
                  onClick={(e) => handleDelete(item.url, e)}
                  className="p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { saveToHistory, getHistory };
