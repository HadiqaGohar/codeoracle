"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RepoInput from "@/components/RepoInput";
import HistoryPanel from "@/components/HistoryPanel";
import Pricing from "@/components/Pricing";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Code,
  Bug,
  FileText,
  Network,
  BookOpen,
  Wrench,
  Shield,
  Zap,
  ArrowRight,
  Link,
  Sparkles,
  BarChart3,
} from "lucide-react";

const features = [
  { icon: Code, label: "Code Explanation", desc: "Understand code structure and logic with detailed AI explanations" },
  { icon: Bug, label: "Bug Detection", desc: "Find potential bugs, logic errors, and edge cases automatically" },
  { icon: FileText, label: "README Improve", desc: "Generate or improve documentation with best practices" },
  { icon: Network, label: "Architecture", desc: "Visual Mermaid diagrams of your codebase architecture" },
  { icon: BookOpen, label: "Documentation", desc: "Auto-generate comprehensive API docs and guides" },
  { icon: Wrench, label: "Refactoring", desc: "Get code improvement suggestions following SOLID principles" },
  { icon: Shield, label: "Security", desc: "Identify security vulnerabilities and get fix recommendations" },
];

const steps = [
  { icon: Link, title: "Paste Repository URL", desc: "Simply paste any GitHub repository URL" },
  { icon: BarChart3, title: "AI Analyzes Code", desc: "Gemini AI reads and understands your entire codebase" },
  { icon: Sparkles, title: "Get Insights", desc: "Receive detailed analysis, suggestions, and diagrams" },
];

const stats = [
  { value: "500+", label: "Repos Analyzed" },
  { value: "10K+", label: "Analyses Run" },
  { value: "7", label: "AI Analysis Types" },
  { value: "100%", label: "Free to Start" },
];

function ScrollSection({ children, className = "", animation = "fade-in-up" }: { children: React.ReactNode; className?: string; animation?: string }) {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div ref={ref} className={`${animation} ${isVisible ? "visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (url: string) => {
    setIsLoading(true);
    router.push(`/analyze?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-900/10 via-transparent to-transparent" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />

          <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-32 text-center">
            <ScrollSection animation="scale-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-900/20 border border-violet-800/30 rounded-full text-violet-400 text-sm mb-8">
                <Zap className="w-4 h-4" />
                Powered by Google Gemini AI
              </div>
            </ScrollSection>

            <ScrollSection animation="fade-in-up" className="stagger-1">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                Analyze Any
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"> GitHub Repo</span>
                <br />With AI
              </h1>
            </ScrollSection>

            <ScrollSection animation="fade-in-up" className="stagger-2">
              <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
                Paste any GitHub repository URL and get instant AI-powered analysis.
                Code explanation, bug detection, security analysis, and more.
              </p>
            </ScrollSection>

            <ScrollSection animation="fade-in-up" className="stagger-3">
              <RepoInput onSubmit={handleSubmit} isLoading={isLoading} />
            </ScrollSection>

            <HistoryPanel onSelect={(url) => router.push(`/analyze?url=${encodeURIComponent(url)}`)} />
          </div>
        </section>

        {/* Stats Section */}
        <ScrollSection>
          <section className="py-12 px-4 border-t border-zinc-800/50">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </div>
                    <div className="text-zinc-500 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollSection>

        {/* How It Works */}
        <section className="py-16 px-4 border-t border-zinc-800/50">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
                How It Works
              </h2>
            </ScrollSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <ScrollSection key={step.title} animation="fade-in-up" className={`stagger-${i + 1}`}>
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4 relative">
                      <step.icon className="w-7 h-7 text-violet-400" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                    <p className="text-zinc-500 text-sm">{step.desc}</p>
                  </div>
                </ScrollSection>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  7 Powerful AI Analyses
                </h2>
                <p className="text-zinc-400 max-w-xl mx-auto">
                  Get comprehensive insights about any codebase in seconds.
                </p>
              </div>
            </ScrollSection>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {features.map((f, i) => (
                <ScrollSection key={f.label} animation="scale-in" className={`stagger-${i + 1}`}>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-violet-500/50 hover:bg-zinc-900 transition-all group">
                    <f.icon className="w-10 h-10 text-violet-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-white font-semibold text-sm mb-1">{f.label}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                </ScrollSection>
              ))}
              <ScrollSection animation="scale-in" className="stagger-7">
                <div className="bg-gradient-to-br from-violet-900/30 to-indigo-900/30 border border-violet-500/30 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:border-violet-500/50 transition-all">
                  <Zap className="w-10 h-10 text-violet-400 mb-3" />
                  <h3 className="text-white font-semibold text-sm mb-1">Run All At Once</h3>
                  <p className="text-zinc-500 text-xs">One click to analyze everything</p>
                </div>
              </ScrollSection>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollSection animation="scale-in">
              <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-3xl p-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Analyze?
                </h2>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                  Start analyzing repositories for free. No signup required.
                </p>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-600/25"
                >
                  Start Analyzing
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </ScrollSection>
          </div>
        </section>

        {/* Pricing */}
        <Pricing />
      </div>
    </div>
  );
}
