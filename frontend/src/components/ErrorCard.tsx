"use client";

import { AlertCircle, RefreshCw, Wifi, WifiOff, Clock } from "lucide-react";

interface ErrorCardProps {
  title?: string;
  message: string;
  type?: "error" | "network" | "rate-limit" | "timeout";
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorCard({
  title,
  message,
  type = "error",
  onRetry,
  retryLabel = "Try Again",
}: ErrorCardProps) {
  const icons = {
    error: AlertCircle,
    network: WifiOff,
    "rate-limit": Clock,
    timeout: Clock,
  };

  const colors = {
    error: "border-red-800/50 bg-red-900/20",
    network: "border-orange-800/50 bg-orange-900/20",
    "rate-limit": "border-yellow-800/50 bg-yellow-900/20",
    timeout: "border-yellow-800/50 bg-yellow-900/20",
  };

  const iconColors = {
    error: "text-red-400",
    network: "text-orange-400",
    "rate-limit": "text-yellow-400",
    timeout: "text-yellow-400",
  };

  const defaultTitles = {
    error: "Something went wrong",
    network: "Network error",
    "rate-limit": "Rate limit exceeded",
    timeout: "Request timed out",
  };

  const Icon = icons[type];

  return (
    <div className={`rounded-xl border p-6 ${colors[type]}`}>
      <div className="flex items-start gap-4">
        <div className={`shrink-0 ${iconColors[type]}`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold mb-1">
            {title || defaultTitles[type]}
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
