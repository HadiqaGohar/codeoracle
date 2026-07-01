"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { GitBranch, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

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
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button className="hidden sm:block px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
            Sign In
          </button>
          <Link
            href="/"
            className="hidden sm:block px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-500 hover:to-indigo-500 transition-all"
          >
            Get Started
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            <Link
              href="/#features"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-zinc-400 hover:text-white transition-colors py-2"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-zinc-400 hover:text-white transition-colors py-2"
            >
              Pricing
            </Link>
            <hr className="border-zinc-800" />
            <button className="text-sm text-zinc-400 hover:text-white transition-colors py-2 text-left">
              Sign In
            </button>
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
