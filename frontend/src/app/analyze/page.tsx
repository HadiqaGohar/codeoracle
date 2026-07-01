"use client";

import { useState, useEffect, useCallback, Suspense, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RepoInput from "@/components/RepoInput";
import RepoInfoCard from "@/components/RepoInfoCard";
import AnalysisTabs from "@/components/AnalysisTabs";
import AnalysisResult from "@/components/AnalysisResult";
import FileTree from "@/components/FileTree";
import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchRepo, analyzeCodeStream, analyzeBatch } from "@/lib/api";
import { FetchRepoResponse, AnalysisType, ANALYSIS_LABELS } from "@/types";
import ExportButtons from "@/components/ExportButtons";
import ShareButtons from "@/components/ShareButtons";
import MobileFileDrawer from "@/components/MobileFileDrawer";
import { saveToHistory } from "@/components/HistoryPanel";
import { AlertCircle, ArrowLeft, Keyboard } from "lucide-react";
import ShortcutsModal from "@/components/ShortcutsModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import ErrorCard from "@/components/ErrorCard";

const STORAGE_PREFIX = "repo-analysis-";

function getStorageKey(url: string): string {
  return STORAGE_PREFIX + btoa(url.replace(/[^a-zA-Z0-9]/g, "")).slice(0, 32);
}

function saveToStorage(url: string, results: Record<AnalysisType, string>, completed: Set<AnalysisType>) {
  try {
    const data = { results, completed: Array.from(completed), timestamp: Date.now() };
    localStorage.setItem(getStorageKey(url), JSON.stringify(data));
  } catch { /* storage full or unavailable */ }
}

function loadFromStorage(url: string): { results: Record<AnalysisType, string>; completed: Set<AnalysisType> } | null {
  try {
    const raw = localStorage.getItem(getStorageKey(url));
    if (!raw) return null;
    const data = JSON.parse(raw);
    const age = Date.now() - (data.timestamp || 0);
    if (age > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(getStorageKey(url));
      return null;
    }
    const results = data.results || {};
    const completed = new Set<string>(data.completed || []);
    const cleanResults: Record<string, string> = {};
    const cleanCompleted = new Set<string>();
    for (const [key, val] of Object.entries(results)) {
      if (typeof val === "string" && !val.startsWith("**Error:**")) {
        cleanResults[key] = val;
        cleanCompleted.add(key);
      }
    }
    return {
      results: cleanResults as Record<AnalysisType, string>,
      completed: cleanCompleted as Set<AnalysisType>,
    };
  } catch {
    return null;
  }
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlParam = searchParams.get("url") || "";
  const tabParam = searchParams.get("tab") as AnalysisType | null;

  const [repoUrl, setRepoUrl] = useState(urlParam);
  const [repoData, setRepoData] = useState<FetchRepoResponse | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisType>(
    tabParam && ["code_explain", "bug_detection", "readme_improve", "architecture", "documentation", "refactoring", "security"].includes(tabParam)
      ? tabParam
      : "code_explain"
  );
  const [results, setResults] = useState<Record<AnalysisType, string>>({} as Record<AnalysisType, string>);
  const [tabErrors, setTabErrors] = useState<Record<AnalysisType, { message: string; type: "error" | "network" | "rate-limit" | "timeout" } | null>>({} as Record<AnalysisType, null>);
  const [completedAnalyses, setCompletedAnalyses] = useState<Set<AnalysisType>>(new Set());
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState<AnalysisType | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamStatus, setStreamStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [restoredFromCache, setRestoredFromCache] = useState(false);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [runAllProgress, setRunAllProgress] = useState({ done: 0, total: 0 });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const streamingContentRef = useRef("");
  const analysisContentRef = useRef<HTMLDivElement>(null);

  const allTabs: AnalysisType[] = [
    "code_explain", "bug_detection", "readme_improve",
    "architecture", "documentation", "refactoring", "security"
  ];

  const classifyError = (err: string): { message: string; type: "error" | "network" | "rate-limit" | "timeout" } => {
    if (err.includes("429") || err.includes("quota") || err.includes("rate limit") || err.includes("RESOURCE_EXHAUSTED")) {
      return {
        message: "AI rate limit exceeded. Please wait a moment and try again.",
        type: "rate-limit",
      };
    }
    if (err.includes("timeout") || err.includes("TIMEOUT")) {
      return { message: "Request timed out. The repository may be too large.", type: "timeout" };
    }
    if (err.includes("network") || err.includes("fetch") || err.includes("ECONNREFUSED")) {
      return { message: "Network error. Please check your connection.", type: "network" };
    }
    return { message: err, type: "error" };
  };

  const keyboardHandlers = useMemo(() => ({
    onFocusSearch: () => {
      const input = document.querySelector<HTMLInputElement>('input[type="text"]');
      input?.focus();
    },
    onSwitchTab: (index: number) => {
      if (allTabs[index]) {
        handleTabChange(allTabs[index]);
      }
    },
    onRunAnalysis: () => {
      if (repoUrl && !analyzing && !results[activeTab]) {
        handleAnalyze(activeTab);
      }
    },
    onToggleHelp: () => setShowShortcuts((v) => !v),
  }), [activeTab, analyzing, repoUrl, results]);

  useKeyboardShortcuts(keyboardHandlers);

  const loadRepo = useCallback(async (url: string) => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRepo(url);
      setRepoData(data);

      const cached = loadFromStorage(url);
      if (cached && Object.keys(cached.results).length > 0) {
        setResults(cached.results);
        setCompletedAnalyses(cached.completed);
        setRestoredFromCache(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch repository");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (urlParam) {
      loadRepo(urlParam);
    }
  }, [urlParam, loadRepo]);

  useEffect(() => {
    if (repoUrl && Object.keys(results).length > 0) {
      saveToStorage(repoUrl, results, completedAnalyses);
    }
  }, [repoUrl, results, completedAnalyses]);

  const handleAnalyze = async (type: AnalysisType) => {
    if (!repoUrl) return;
    setAnalyzing(type);
    setActiveTab(type);
    setStreamingContent("");
    setStreamStatus("");
    streamingContentRef.current = "";

    try {
      await analyzeCodeStream(
        repoUrl,
        type,
        (chunk) => {
          streamingContentRef.current += chunk;
          setStreamingContent((prev) => prev + chunk);
        },
        (status) => {
          setStreamStatus(status);
        },
        (err) => {
          setTabErrors((prev) => ({ ...prev, [type]: classifyError(err) }));
          setAnalyzing(null);
        },
        () => {
          setResults((prev) => ({ ...prev, [type]: streamingContentRef.current }));
          setCompletedAnalyses((prev) => {
            const next = new Set(prev).add(type);
            if (repoData?.repo_info) {
              saveToHistory(repoUrl, repoData.repo_info.full_name, next.size);
            }
            return next;
          });
          setAnalyzing(null);
          setStreamStatus("");
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setTabErrors((prev) => ({ ...prev, [type]: classifyError(msg) }));
      setAnalyzing(null);
    }
  };

  const handleTabChange = (type: AnalysisType) => {
    setActiveTab(type);
    router.replace(`/analyze?url=${encodeURIComponent(repoUrl)}&tab=${type}`, { scroll: false });
    if (!results[type] && !tabErrors[type] && !analyzing) {
      handleAnalyze(type);
    }
  };

  const handleRunAll = async () => {
    if (!repoUrl || isRunningAll) return;
    setIsRunningAll(true);

    const allTypes: AnalysisType[] = [
      "code_explain", "bug_detection", "readme_improve",
      "architecture", "documentation", "refactoring", "security"
    ];

    const pending = allTypes.filter((t) => !results[t]);
    setRunAllProgress({ done: 0, total: pending.length });

    try {
      const batchResponse = await analyzeBatch(repoUrl, pending);
      
      const newResults = { ...results };
      for (const item of batchResponse.results) {
        const type = item.type as AnalysisType;
        newResults[type] = item.result;
      }
      setResults(newResults);

      const newCompleted = new Set(completedAnalyses);
      for (const item of batchResponse.results) {
        newCompleted.add(item.type as AnalysisType);
      }
      setCompletedAnalyses(newCompleted);

      if (batchResponse.repo_info) {
        saveToHistory(repoUrl, batchResponse.repo_info.full_name, newCompleted.size);
      }

      setRunAllProgress({ done: pending.length, total: pending.length });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Batch analysis failed");
    } finally {
      setIsRunningAll(false);
      setRunAllProgress({ done: 0, total: 0 });
    }
  };

  const handleNewRepo = (url: string) => {
    setRepoUrl(url);
    setRepoData(null);
    setResults({} as Record<AnalysisType, string>);
    setTabErrors({} as Record<AnalysisType, null>);
    setCompletedAnalyses(new Set());
    setStreamingContent("");
    setStreamStatus("");
    setError(null);
    setRestoredFromCache(false);
    router.push(`/analyze?url=${encodeURIComponent(url)}&tab=code_explain`);
  };

  const getStatusMessage = () => {
    if (streamStatus === "fetching_repo") return "Fetching repository files...";
    if (streamStatus === "analyzing") return "AI is analyzing your code...";
    return `Running ${ANALYSIS_LABELS[activeTab]} analysis...`;
  };

  return (
    <div className="min-h-screen">
      <ShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <main className="flex flex-col">
        {!repoData && !loading && !error && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-3">Analyze Repository</h1>
              <p className="text-zinc-500">Paste a GitHub URL to get started</p>
            </div>
            <RepoInput onSubmit={handleNewRepo} isLoading={loading} />
          </div>
        )}

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner message="Fetching repository files..." />
          </div>
        )}

        {error && !repoData && (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full">
              <ErrorCard
                message={error}
                type={
                  error.includes("rate") || error.includes("429")
                    ? "rate-limit"
                    : error.includes("network") || error.includes("fetch")
                      ? "network"
                      : "error"
                }
                onRetry={() => {
                  setError(null);
                  if (repoUrl) loadRepo(repoUrl);
                }}
                retryLabel="Try Again"
              />
            </div>
          </div>
        )}

        {repoData && (
          <div className="flex-1 flex flex-col">
            <div className="border-b border-zinc-800 bg-zinc-950/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <button
                  onClick={() => router.push("/")}
                  className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  New Analysis
                </button>
                <RepoInfoCard info={repoData.repo_info} />
                {restoredFromCache && (
                  <div className="mt-2 text-xs text-emerald-500">
                    Results restored from previous session ({completedAnalyses.size} analyses cached)
                  </div>
                )}
                <div className="mt-4">
                  <AnalysisTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    onRunAll={handleRunAll}
                    completedAnalyses={completedAnalyses}
                    isRunningAll={isRunningAll}
                  />
                  {isRunningAll && runAllProgress.total > 0 && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
                          style={{ width: `${(runAllProgress.done / runAllProgress.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400 whitespace-nowrap">
                        {runAllProgress.done}/{runAllProgress.total} completed
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex gap-6">
                <div className="hidden lg:block w-64 shrink-0">
                  <div className="sticky top-24">
                    <FileTree files={repoData.file_tree} />
                  </div>
                </div>
                <MobileFileDrawer files={repoData.file_tree} />
                <div className="flex-1 min-w-0">
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">
                        {ANALYSIS_LABELS[activeTab]}
                      </h2>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowShortcuts(true)}
                          className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
                          title="Keyboard shortcuts (?)"
                        >
                          <Keyboard className="w-4 h-4" />
                        </button>
                        {analyzing && (
                          <span className="text-xs text-violet-400 animate-pulse">
                            Streaming...
                          </span>
                        )}
                        {results[activeTab] && !analyzing && (
                          <>
                            <ShareButtons
                              shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/analyze?url=${encodeURIComponent(repoUrl)}&tab=${activeTab}`}
                              repoName={repoData?.repo_info?.full_name || "repository"}
                              analysisType={ANALYSIS_LABELS[activeTab]}
                            />
                            <ExportButtons
                              content={results[activeTab]}
                              filename={`${repoData?.repo_info?.name || "repo"}-${activeTab}`}
                              contentRef={analysisContentRef}
                            />
                          </>
                        )}
                      </div>
                    </div>
                    {analyzing === activeTab ? (
                      <div>
                        {streamingContent ? (
                          <AnalysisResult content={streamingContent} />
                        ) : (
                          <LoadingSpinner message={getStatusMessage()} />
                        )}
                      </div>
                    ) : tabErrors[activeTab] ? (
                      <div ref={analysisContentRef}>
                        <ErrorCard
                          message={tabErrors[activeTab]!.message}
                          type={tabErrors[activeTab]!.type}
                          onRetry={() => {
                            setTabErrors((prev) => ({ ...prev, [activeTab]: null }));
                            setResults((prev) => {
                              const next = { ...prev };
                              delete next[activeTab];
                              return next;
                            });
                            handleAnalyze(activeTab);
                          }}
                        />
                      </div>
                    ) : results[activeTab] ? (
                      <div ref={analysisContentRef}>
                        <AnalysisResult content={results[activeTab]} />
                      </div>
                    ) : (
                      <div className="text-center py-12 text-zinc-500">
                        Click the analysis tab to start
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <LoadingSpinner message="Loading..." />
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
