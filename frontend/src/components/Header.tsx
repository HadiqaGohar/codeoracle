"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { GitBranch, Menu, X, User, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isLoggedIn = mounted && !!session?.user;

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
          <button
            onClick={() => document.getElementById("chatbot-faq")?.click()}
            className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            FAQ
          </button>
          <button
            onClick={() => document.getElementById("chatbot-about")?.click()}
            className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            About
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
          ) : isLoggedIn ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ""}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="max-w-[100px] truncate">{session?.user?.name || "Profile"}</span>
              </Link>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-500 hover:to-indigo-500 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
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
            <button
              onClick={() => {
                setMobileOpen(false);
                setTimeout(() => document.getElementById("chatbot-faq")?.click(), 100);
              }}
              className="text-sm text-zinc-400 hover:text-white transition-colors py-2 text-left"
            >
              FAQ
            </button>
            <button
              onClick={() => {
                setMobileOpen(false);
                setTimeout(() => document.getElementById("chatbot-about")?.click(), 100);
              }}
              className="text-sm text-zinc-400 hover:text-white transition-colors py-2 text-left"
            >
              About
            </button>
            <hr className="border-zinc-800" />
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors py-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors py-2 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-zinc-400 hover:text-white transition-colors py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
