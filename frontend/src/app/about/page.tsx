"use client";

import Link from "next/link";
import {
  ArrowLeft,
  GitBranch,
  Code,
  Shield,
  Network,
  BookOpen,
  Wrench,
  Bug,
  FileText,
  AlertTriangle,
  MessageCircle,
  BarChart3,
  ArrowRightLeft,
  FlaskConical,
  Users,
  Bell,
  Key,
  Folder,
  Globe,
  Zap,
  Heart,
} from "lucide-react";

const FEATURES = [
  { icon: Code, title: "Code Explanation", desc: "Understand every file and function" },
  { icon: Bug, title: "Bug Detection", desc: "Find potential bugs before they happen" },
  { icon: Shield, title: "Security Analysis", desc: "Detect vulnerabilities and threats" },
  { icon: Network, title: "Architecture Diagrams", desc: "Visual Mermaid architecture maps" },
  { icon: Wrench, title: "Refactoring Suggestions", desc: "Improve code quality and structure" },
  { icon: FileText, title: "Documentation", desc: "Auto-generate comprehensive docs" },
  { icon: AlertTriangle, title: "Code Smell Detector", desc: "Find anti-patterns and bad practices" },
  { icon: FlaskConical, title: "Test Coverage Gaps", desc: "Find untested functions, get test suggestions" },
  { icon: MessageCircle, title: "Chat with Repo", desc: "Ask AI anything about your codebase" },
  { icon: ArrowRightLeft, title: "Migration Assistant", desc: "Convert between frameworks with AI" },
  { icon: BarChart3, title: "Repo Timeline", desc: "Growth charts and contributor activity" },
  { icon: Users, title: "Contributor Insights", desc: "Bus factor risk and team analysis" },
];

const TECH_STACK = [
  { name: "Next.js 16", role: "Frontend Framework" },
  { name: "React 19", role: "UI Library" },
  { name: "TypeScript", role: "Type Safety" },
  { name: "Tailwind CSS", role: "Styling" },
  { name: "Python FastAPI", role: "Backend API" },
  { name: "Google Gemini AI", role: "AI Engine" },
  { name: "OpenRouter", role: "AI Gateway" },
  { name: "Recharts", role: "Data Visualization" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
            <GitBranch className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">
            Code<span className="text-violet-400">Oracle</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-2">AI-Powered Repository Analyzer</p>
          <p className="text-sm text-zinc-600">
            Built with <Heart className="w-3.5 h-3.5 inline text-red-500 fill-red-500" /> by{" "}
            <span className="text-zinc-400">Hadiqa Gohar</span>
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">What We Do</h2>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <p className="text-zinc-400 leading-relaxed text-center max-w-3xl mx-auto">
              CodeOracle uses AI to analyze GitHub repositories and provide instant insights into
              code quality, security vulnerabilities, architecture, and more. Simply paste a
              repository URL and get comprehensive analysis in seconds. Whether you&apos;re reviewing
              open source code, onboarding to a new project, or doing a security audit — CodeOracle
              has you covered.
            </p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
              >
                <f.icon className="w-8 h-8 text-violet-400 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-xs text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Tech Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TECH_STACK.map((t) => (
              <div key={t.name} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                <div className="text-sm font-semibold text-white mb-1">{t.name}</div>
                <div className="text-[10px] text-zinc-500">{t.role}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">By the Numbers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: "8+", label: "Analysis Types" },
              { value: "20+", label: "Features" },
              { value: "100%", label: "Open Source" },
              { value: "Free", label: "Tier Available" },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-violet-400">{s.value}</div>
                <div className="text-xs text-zinc-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <Zap className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Ready to analyze your code?</h3>
          <p className="text-sm text-zinc-500 mb-6">
            Paste any GitHub repository URL and get instant AI-powered insights.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-lg hover:from-violet-500 hover:to-indigo-500 transition-all"
          >
            <Code className="w-4 h-4" />
            Start Analyzing
          </Link>
        </div>
      </main>
    </div>
  );
}
