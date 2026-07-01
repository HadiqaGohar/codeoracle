"use client";

import Link from "next/link";
import { GitBranch } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">
              Code<span className="text-violet-400">Oracle</span>
            </h1>
            <p className="text-[10px] text-zinc-500 leading-tight">AI Repository Analyzer</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Pricing
          </Link>
          <a
            href="https://hadiqa-gohar.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Portfolio
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
            Sign In
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-500 hover:to-indigo-500 transition-all">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
