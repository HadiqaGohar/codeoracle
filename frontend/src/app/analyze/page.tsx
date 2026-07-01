"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import RepoInput from "@/components/RepoInput";
import RepoInfoCard from "@/components/RepoInfoCard";
import AnalysisTabs from "@/components/AnalysisTabs";
import AnalysisResult from "@/components/AnalysisResult";
import FileTree from "@/components/FileTree";
import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchRepo, analyzeCodeStream } from "@/lib/api";
import { FetchRepoResponse, AnalysisType, ANALYSIS_LABELS } from "@/types";
import ExportButtons from "@/components/ExportButtons";
import { AlertCircle, ArrowLeft } from "lucide-react";

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
    return {
      results: data.results || {},
      completed: new Set(data.completed || []),
    };
  } catch {
    return null;
  }
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlParam = searchParams.get("url") || "";

  const [repoUrl, setRepoUrl] = useState(urlParam);
  const [repoData, setRepoData] = useState<FetchRepoResponse | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisType>("code_explain");
  const [results, setResults] = useState<Record<AnalysisType, string>>({} as Record<AnalysisType, string>);
  const [completedAnalyses, setCompletedAnalyses] = useState<Set<AnalysisType>>(new Set());
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState<AnalysisType | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamStatus, setStreamStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [restoredFromCache, setRestoredFromCache] = useState(false);

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

    try {
      await analyzeCodeStream(
        repoUrl,
        type,
        (chunk) => {
          setStreamingContent((prev) => prev + chunk);
        },
        (status) => {
          setStreamStatus(status);
        },
        (err) => {
          setResults((prev) => ({
            ...prev,
            [type]: `**Error:** ${err}`,
          }));
          setAnalyzing(null);
        },
        () => {
          setResults((prev) => ({ ...prev, [type]: streamingContent }));
          setCompletedAnalyses((prev) => new Set(prev).add(type));
          setAnalyzing(null);
          setStreamStatus("");
        }
      );
    } catch (err: unknown) {
      setResults((prev) => ({
        ...prev,
        [type]: `**Error:** ${err instanceof Error ? err.message : "Analysis failed"}`,
      }));
      setAnalyzing(null);
    }
  };

  const handleTabChange = (type: AnalysisType) => {
    setActiveTab(type);
    if (!results[type] && !analyzing) {
      handleAnalyze(type);
    }
  };

  const handleNewRepo = (url: string) => {
    setRepoUrl(url);
    setRepoData(null);
    setResults({} as Record<AnalysisType, string>);
    setCompletedAnalyses(new Set());
    setStreamingContent("");
    setStreamStatus("");
    setError(null);
    setRestoredFromCache(false);
    router.push(`/analyze?url=${encodeURIComponent(url)}`);
  };

  const getStatusMessage = () => {
    if (streamStatus === "fetching_repo") return "Fetching repository files...";
    if (streamStatus === "analyzing") return "AI is analyzing your code...";
    return `Running ${ANALYSIS_LABELS[activeTab]} analysis...`;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
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
            <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6 max-w-md text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-white font-semibold mb-2">Error</h2>
              <p className="text-zinc-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  router.push("/");
                }}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm"
              >
                Try Again
              </button>
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
                    completedAnalyses={completedAnalyses}
                  />
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
                <div className="flex-1 min-w-0">
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">
                        {ANALYSIS_LABELS[activeTab]}
                      </h2>
                      <div className="flex items-center gap-3">
                        {analyzing && (
                          <span className="text-xs text-violet-400 animate-pulse">
                            Streaming...
                          </span>
                        )}
                        {results[activeTab] && !analyzing && (
                          <ExportButtons
                            content={results[activeTab]}
                            filename={`${repoData?.repo_info?.name || "repo"}-${activeTab}`}
                          />
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
                    ) : results[activeTab] ? (
                      <AnalysisResult content={results[activeTab]} />
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
