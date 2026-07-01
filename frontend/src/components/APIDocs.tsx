"use client";

import { useState } from "react";
import { Code, Copy, Check, Key, ExternalLink } from "lucide-react";

export default function APIDocs() {
  const [apiKey, setApiKey] = useState("");
  const [owner, setOwner] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!owner) return;
    setGenerating(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${API_URL}/api/api-keys/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner }),
      });
      const data = await res.json();
      setApiKey(data.api_key);
    } catch {}
    setGenerating(false);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
        <Code className="w-4 h-4 text-green-400" />
        <h3 className="text-sm font-semibold text-white">API Access</h3>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-xs text-zinc-400 font-medium mb-2">Generate API Key</h4>
          <div className="flex gap-2">
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Your name or org"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={handleGenerate}
              disabled={!owner || generating}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 rounded-lg transition-colors text-sm text-white"
            >
              {generating ? "..." : "Generate"}
            </button>
          </div>
        </div>

        {apiKey && (
          <div className="bg-zinc-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-500">Your API Key</span>
              <button onClick={copyKey} className="text-zinc-500 hover:text-white">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <code className="text-xs text-emerald-400 font-mono break-all">{apiKey}</code>
          </div>
        )}

        <div>
          <h4 className="text-xs text-zinc-400 font-medium mb-2">Usage</h4>
          <div className="bg-zinc-800 rounded-lg p-3 space-y-2">
            <div className="text-[10px] text-zinc-500 mb-1">Analyze a repository:</div>
            <pre className="text-[11px] text-zinc-300 font-mono overflow-x-auto">
{`curl -X POST ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/analyze \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey || "YOUR_API_KEY"}" \\
  -d '{"repo_url": "https://github.com/owner/repo", "analysis_type": "security"}'`}
            </pre>
          </div>
        </div>

        <div>
          <h4 className="text-xs text-zinc-400 font-medium mb-2">Endpoints</h4>
          <div className="space-y-2">
            {[
              { method: "POST", path: "/api/analyze", desc: "Single analysis" },
              { method: "POST", path: "/api/analyze-stream", desc: "Streaming analysis (SSE)" },
              { method: "POST", path: "/api/analyze-batch", desc: "Batch analysis" },
              { method: "POST", path: "/api/complexity", desc: "Complexity heatmap" },
              { method: "POST", path: "/api/chat", desc: "Chat with repo" },
              { method: "POST", path: "/api/timeline", desc: "Repo timeline data" },
              { method: "POST", path: "/api/migrate", desc: "Migration assistant" },
              { method: "GET", path: "/api/health", desc: "Health check" },
            ].map((ep) => (
              <div key={ep.path} className="flex items-center gap-2 text-xs">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  ep.method === "GET" ? "bg-emerald-600/20 text-emerald-400" : "bg-violet-600/20 text-violet-400"
                }`}>
                  {ep.method}
                </span>
                <code className="text-zinc-300 font-mono">{ep.path}</code>
                <span className="text-zinc-600">—</span>
                <span className="text-zinc-500">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
