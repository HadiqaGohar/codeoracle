"use client";

import { useState } from "react";
import { Search, ArrowRight, Loader2 } from "lucide-react";

interface RepoInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function RepoInput({ onSubmit, isLoading }: RepoInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-violet-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden focus-within:border-violet-500/50 transition-colors">
          <div className="pl-4 text-zinc-500">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste GitHub repository URL..."
            className="flex-1 bg-transparent px-3 py-4 text-white placeholder-zinc-500 outline-none text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="m-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
      <p className="text-center text-zinc-600 text-xs mt-3">
        Example: https://github.com/facebook/react
      </p>
    </form>
  );
}
