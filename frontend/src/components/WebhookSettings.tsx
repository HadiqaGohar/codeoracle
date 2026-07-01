"use client";

import { useState } from "react";
import { Bell, Loader2, Check, Webhook } from "lucide-react";

interface WebhookSettingsProps {
  repoUrl: string;
  repoName: string;
}

export default function WebhookSettings({ repoUrl, repoName }: WebhookSettingsProps) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!webhookUrl) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${API_URL}/api/webhook/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhook_url: webhookUrl, repo_url: repoUrl }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Webhook registration failed");
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
        <Bell className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-white">Webhook Notifications</h3>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-zinc-500">
          Get notified on Slack/Discord when analysis completes. Paste a webhook URL from your workspace.
        </p>

        <div className="flex gap-2">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/... or Discord webhook"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={handleRegister}
            disabled={!webhookUrl || loading}
            className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : success ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Bell className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {success && (
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> Test notification sent! Check your workspace.
          </div>
        )}

        {error && (
          <div className="text-xs text-red-400">{error}</div>
        )}
      </div>
    </div>
  );
}
