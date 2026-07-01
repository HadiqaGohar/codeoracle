"use client";

import { useState } from "react";
import { ArrowRightLeft, Loader2, GitBranch } from "lucide-react";
import AnalysisResult from "./AnalysisResult";

interface MigrationAssistantProps {
  repoUrl: string;
  repoName: string;
}

const FRAMEWORKS = [
  { value: "fastapi", label: "FastAPI", icon: "⚡" },
  { value: "django", label: "Django", icon: "🐍" },
  { value: "flask", label: "Flask", icon: "🌶️" },
  { value: "express", label: "Express.js", icon: "🚂" },
  { value: "nextjs", label: "Next.js", icon: "▲" },
  { value: "nestjs", label: "NestJS", icon: "🐱" },
  { value: "gin", label: "Gin (Go)", icon: "🍃" },
  { value: "spring-boot", label: "Spring Boot", icon: "🍃" },
  { value: "rails", label: "Rails", icon: "🛤️" },
  { value: "laravel", label: "Laravel", icon: "🔷" },
];

export default function MigrationAssistant({ repoUrl, repoName }: MigrationAssistantProps) {
  const [target, setTarget] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMigrate = async () => {
    if (!target) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${API_URL}/api/migrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl, target_framework: target }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Migration analysis failed");
      }
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
        <ArrowRightLeft className="w-4 h-4 text-orange-400" />
        <h3 className="text-sm font-semibold text-white">Migration Assistant</h3>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <label className="text-[10px] text-zinc-500 block mb-1">Current Framework</label>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300">
              <GitBranch className="w-3 h-3 inline mr-1.5" />
              {repoName.split("/")[1] || repoName}
            </div>
          </div>
          <ArrowRightLeft className="w-4 h-4 text-zinc-600 mt-4" />
          <div className="flex-1">
            <label className="text-[10px] text-zinc-500 block mb-1">Target Framework</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-violet-500"
            >
              <option value="">Select target...</option>
              {FRAMEWORKS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.icon} {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleMigrate}
          disabled={!target || loading}
          className="w-full py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing migration...
            </span>
          ) : (
            "Generate Migration Guide"
          )}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4">
            <AnalysisResult content={result} />
          </div>
        )}
      </div>
    </div>
  );
}
