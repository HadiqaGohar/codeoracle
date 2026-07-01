"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RepoInput from "@/components/RepoInput";
import {
  Code,
  Bug,
  FileText,
  Network,
  BookOpen,
  Wrench,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  { icon: Code, label: "Code Explanation", desc: "Understand code structure and logic" },
  { icon: Bug, label: "Bug Detection", desc: "Find potential bugs and issues" },
  { icon: FileText, label: "README Improve", desc: "Generate better documentation" },
  { icon: Network, label: "Architecture", desc: "Visual diagram of codebase" },
  { icon: BookOpen, label: "Documentation", desc: "Auto-generate docs" },
  { icon: Wrench, label: "Refactoring", desc: "Code improvement suggestions" },
  { icon: Shield, label: "Security", desc: "Find security vulnerabilities" },
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (url: string) => {
    setIsLoading(true);
    router.push(`/analyze?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-900/20 border border-violet-800/30 rounded-full text-violet-400 text-sm mb-8">
            <Zap className="w-4 h-4" />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
            AI Repository
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              {" "}Analyzer
            </span>
          </h1>

          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            Paste any GitHub repository URL and get instant AI-powered analysis.
            Understand code, find bugs, improve docs, and more.
          </p>

          <RepoInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-20 max-w-4xl w-full px-4">
          {features.map((f) => (
            <div
              key={f.label}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors group"
            >
              <f.icon className="w-8 h-8 text-violet-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold text-sm">{f.label}</h3>
              <p className="text-zinc-500 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center py-6 text-zinc-600 text-sm">
        Built with Next.js 15 & FastAPI
      </footer>
    </div>
  );
}
