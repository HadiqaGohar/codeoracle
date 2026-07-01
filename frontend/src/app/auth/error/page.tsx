"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "Server configuration error. Please contact support.",
    AccessDenied: "Access denied. You may not have permission to sign in.",
    Verification: "Verification link expired or already used.",
    Default: "An error occurred during sign in.",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-900/20 border border-red-800/50 rounded-2xl p-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Sign In Error</h1>
          <p className="text-zinc-400 text-sm mb-6">
            {errorMessages[error || ""] || errorMessages.Default}
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors text-sm font-medium"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
