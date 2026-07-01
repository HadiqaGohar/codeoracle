"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const FAQ_DATA = [
  {
    category: "Getting Started",
    items: [
      {
        q: "What is CodeOracle?",
        a: "CodeOracle is a free AI-powered GitHub repository analyzer. Paste any repo URL and get instant code explanation, bug detection, security analysis, architecture diagrams, and more — all powered by Google Gemini AI.",
      },
      {
        q: "How do I use CodeOracle?",
        a: "Simply paste a GitHub repository URL into the search box on the Analyze page, select the type of analysis you want (Code Explanation, Bug Detection, Security Analysis, etc.), and click Analyze. Results stream in real-time.",
      },
      {
        q: "Is CodeOracle free?",
        a: "Yes! CodeOracle offers a free tier with 5 analyses per day. For unlimited analyses, custom prompts, and premium features, check our Pro plan at $12/month.",
      },
      {
        q: "Do I need an account?",
        a: "No account is required for basic analysis. Sign in with GitHub or Google to unlock history tracking, workspaces, and premium features.",
      },
    ],
  },
  {
    category: "Analysis Types",
    items: [
      {
        q: "What analysis types are available?",
        a: "CodeOracle supports 8 analysis types:\n\n• Code Explanation — Understand what each file does\n• Bug Detection — Find potential bugs and issues\n• Security Analysis — Detect vulnerabilities\n• Architecture Diagram — Visual Mermaid diagrams\n• Refactoring Suggestions — Code improvement tips\n• Documentation Generation — Auto-generate docs\n• README Improvement — Create/improve README\n• Code Smell Detector — Find anti-patterns",
      },
      {
        q: "Can I run all analyses at once?",
        a: "Yes! Click the 'Run All' button to run all 8 analysis types at once. Results are processed in batches of 3 for optimal performance.",
      },
      {
        q: "Can I analyze private repos?",
        a: "CodeOracle analyzes public GitHub repositories. For private repos, you can configure a GitHub token in the backend settings to enable access.",
      },
      {
        q: "Does CodeOracle support languages other than JavaScript/Python?",
        a: "Yes! CodeOracle can analyze any language — Go, Rust, Java, Ruby, C++, and more. The AI understands all major programming languages.",
      },
    ],
  },
  {
    category: "Features",
    items: [
      {
        q: "What is the Code Quality Score?",
        a: "The Code Quality Score is a 0-100 score that combines results from all analysis types into a single metric. It shows security, bugs, architecture, and other scores in a visual breakdown.",
      },
      {
        q: "What is the File Complexity Heatmap?",
        a: "The Heatmap color-codes your file tree based on code complexity. Red files are highly complex, green files are clean. It helps you quickly identify which parts of your codebase need attention.",
      },
      {
        q: "Can I chat with my repository?",
        a: "Yes! The Chat with Repo feature lets you ask follow-up questions about your codebase in a chatbot interface. Ask things like 'Where is this function used?' or 'What are the dependencies?'",
      },
      {
        q: "What is the Migration Assistant?",
        a: "The Migration Assistant generates a complete guide to migrate your code from one framework to another (e.g., Flask to FastAPI). It provides step-by-step instructions with code examples.",
      },
      {
        q: "What is the Test Coverage Gap Finder?",
        a: "The Test Coverage Gap Finder scans your codebase to find untested functions and generates AI-suggested test cases. It detects your test framework (pytest, jest, go test, etc.) automatically.",
      },
      {
        q: "What are Contributor Insights?",
        a: "Contributor Insights shows bus factor risk, top contributors, and code frequency. A bus factor of 1-2 means the project is at risk if a key contributor leaves.",
      },
    ],
  },
  {
    category: "Integration",
    items: [
      {
        q: "Can I use CodeOracle's API programmatically?",
        a: "Yes! Generate an API key from the API section and use our REST API to integrate CodeOracle into your own tools and workflows. All 8 analysis types are available via API.",
      },
      {
        q: "How does the Browser Extension work?",
        a: "The Chrome extension adds an 'Analyze with CodeOracle' button directly on GitHub repository pages. Click it to instantly open CodeOracle with that repo pre-loaded.",
      },
      {
        q: "Can I get notifications when analysis completes?",
        a: "Yes! Use the Webhook feature to connect Slack or Discord. When analysis finishes, you'll get a rich embed notification with repo name, analysis type, and quality score.",
      },
      {
        q: "What are Team Workspaces?",
        a: "Team Workspaces let you share analyses with your team. Create a workspace, add members by email, and share analysis results. Great for code reviews and collaborative analysis.",
      },
    ],
  },
];

export default function FAQPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Frequently Asked <span className="text-violet-400">Questions</span>
          </h1>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Everything you need to know about CodeOracle. Can&apos;t find what you&apos;re looking for?{" "}
            <Link href="/" className="text-violet-400 hover:text-violet-300">
              Chat with our AI assistant
            </Link>
            .
          </p>
        </div>

        <div className="space-y-8">
          {FAQ_DATA.map((section) => (
            <div key={section.category}>
              <h2 className="text-lg font-semibold text-white mb-4">{section.category}</h2>
              <div className="space-y-2">
                {section.items.map((faq, i) => {
                  const key = `${section.category}-${i}`;
                  return (
                    <div
                      key={key}
                      className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50"
                    >
                      <button
                        onClick={() => setExpanded(expanded === key ? null : key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                      >
                        <span className="text-sm font-medium text-zinc-200 pr-4">{faq.q}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform ${
                            expanded === key ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {expanded === key && (
                        <div className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-3 whitespace-pre-wrap">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <MessageCircle className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Still have questions?</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Use our AI chatbot for instant answers about CodeOracle.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-violet-500 hover:to-indigo-500 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Open Chat
          </Link>
        </div>
      </main>
    </div>
  );
}
