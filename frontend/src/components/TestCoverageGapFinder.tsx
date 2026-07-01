"use client";

import { useState } from "react";
import { FlaskConical, Loader2, TestTube } from "lucide-react";
import AnalysisResult from "./AnalysisResult";

interface TestCoverageGapFinderProps {
  repoUrl: string;
}

export default function TestCoverageGapFinder({ repoUrl }: TestCoverageGapFinderProps) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${API_URL}/api/test-gaps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Test gap analysis failed");
      }
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Test Coverage Gap Finder</h3>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <TestTube className="w-3 h-3" />
          )}
          {loading ? "Analyzing..." : "Find Gaps"}
        </button>
      </div>

      <div className="p-4">
        {loading && !result && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-zinc-400">Scanning codebase for test gaps...</p>
            <p className="text-xs text-zinc-600 mt-1">This may take a moment</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {result && (
          <AnalysisResult content={result} />
        )}

        {!loading && !result && !error && (
          <div className="text-center py-6">
            <FlaskConical className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">Find untested functions and get AI-generated test cases</p>
          </div>
        )}
      </div>
    </div>
  );
}
