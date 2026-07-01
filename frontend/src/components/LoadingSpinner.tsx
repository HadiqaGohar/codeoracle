"use client";

import { Loader2, Sparkles } from "lucide-react";

export default function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-violet-600/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <div className="flex items-center gap-2 text-white font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing repository...
        </div>
        {message && (
          <p className="text-zinc-500 text-sm mt-2">{message}</p>
        )}
      </div>
    </div>
  );
}
