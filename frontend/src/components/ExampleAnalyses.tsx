"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Code, Bug, Shield, Network, ChevronRight, ExternalLink } from "lucide-react";

interface ExampleRepo {
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  icon: React.ReactNode;
  highlights: string[];
}

const examples: ExampleRepo[] = [
  {
    name: "FastAPI",
    fullName: "tiangolo/fastapi",
    description: "Modern web framework for building APIs with Python",
    language: "Python",
    stars: 75000,
    icon: <Code className="w-6 h-6" />,
    highlights: ["Auto-generated docs", "High performance", "Type hints"],
  },
  {
    name: "Next.js",
    fullName: "vercel/next.js",
    description: "The React framework for production",
    language: "TypeScript",
    stars: 120000,
    icon: <Network className="w-6 h-6" />,
    highlights: ["SSR/SSG", "API routes", "Edge runtime"],
  },
  {
    name: "FastAPI",
    fullName: "pallets/flask",
    description: "Lightweight WSGI web application framework",
    language: "Python",
    stars: 67000,
    icon: <Bug className="w-6 h-6" />,
    highlights: ["Minimal core", "Extensions", "Jinja2 templates"],
  },
  {
    name: "Express",
    fullName: "expressjs/express",
    description: "Fast, unopinionated, minimalist web framework for Node.js",
    language: "JavaScript",
    stars: 64000,
    icon: <Shield className="w-6 h-6" />,
    highlights: ["Middleware", "Routing", "Error handling"],
  },
];

export default function ExampleAnalyses() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const router = useRouter();

  const handleAnalyze = (fullName: string) => {
    router.push(`/analyze?url=https://github.com/${fullName}`);
  };

  return (
    <section className="py-20 px-4 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            See It In Action
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Try analyzing popular open-source repositories to see the power of AI-driven code analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examples.map((repo, i) => (
            <div
              key={repo.fullName}
              className="group relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-violet-500/50 hover:bg-zinc-900 transition-all cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleAnalyze(repo.fullName)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                  {repo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{repo.name}</h3>
                    <ExternalLink className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-zinc-500 text-sm mb-3 line-clamp-1">{repo.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {repo.highlights.map((h) => (
                      <span
                        key={h}
                        className="text-xs px-2 py-1 bg-zinc-800 rounded-md text-zinc-400"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                    <span>{repo.language}</span>
                    <span>{(repo.stars / 1000).toFixed(0)}k stars</span>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-zinc-600 transition-all ${
                    hoveredIndex === i ? "text-violet-400 translate-x-1" : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-zinc-500 text-sm">
            Or paste any GitHub repository URL to analyze your own code
          </p>
        </div>
      </div>
    </section>
  );
}
