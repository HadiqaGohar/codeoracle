"use client";

import Link from "next/link";
import { GitBranch, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Code<span className="text-violet-400">Oracle</span>
                </h2>
                <p className="text-[10px] text-zinc-500">AI Repository Analyzer</p>
              </div>
            </Link>
            <p className="text-zinc-500 text-sm max-w-sm">
              Analyze any GitHub repository with AI. Get code explanations, bug detection,
              security analysis, architecture diagrams, and more.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/#features" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Pricing</Link></li>
              <li><Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Analyze Repo</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/HadiqaGohar/codeoracle" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://hadiqa-gohar.vercel.app" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  Portfolio
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <span>Powered by</span>
            <span className="text-violet-400 font-medium">Google Gemini AI</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>by</span>
            <a
              href="https://hadiqa-gohar.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Hadiqa Gohar
            </a>
          </div>
          <p className="text-zinc-600 text-xs">
            &copy; {new Date().getFullYear()} CodeOracle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
