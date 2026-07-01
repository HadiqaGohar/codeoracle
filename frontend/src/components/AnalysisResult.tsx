"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface AnalysisResultProps {
  content: string;
}

export default function AnalysisResult({ content }: AnalysisResultProps) {
  return (
    <div className="prose prose-invert prose-zinc max-w-none">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            if (match) {
              return (
                <div className="relative group my-4">
                  <div className="absolute top-0 right-0 px-2 py-1 text-[10px] font-mono text-zinc-500 bg-zinc-900 rounded-bl-lg rounded-tr-lg">
                    {match[1]}
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: "0.5rem",
                      background: "#0a0a0a",
                      border: "1px solid #27272a",
                    }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return (
              <code
                className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm text-violet-300 font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1({ children }) {
            return (
              <h1 className="text-2xl font-bold text-white mt-8 mb-4 pb-2 border-b border-zinc-800">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-lg font-semibold text-zinc-200 mt-4 mb-2">
                {children}
              </h3>
            );
          },
          p({ children }) {
            return <p className="text-zinc-300 leading-relaxed mb-3">{children}</p>;
          },
          ul({ children }) {
            return <ul className="space-y-1 mb-4 text-zinc-300">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="space-y-1 mb-4 text-zinc-300 list-decimal pl-5">{children}</ol>;
          },
          li({ children }) {
            return <li className="pl-1">{children}</li>;
          },
          strong({ children }) {
            return <strong className="text-white font-semibold">{children}</strong>;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-violet-600 pl-4 my-4 text-zinc-400 italic">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="w-full text-sm text-left">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-zinc-800 text-zinc-200">{children}</thead>;
          },
          th({ children }) {
            return <th className="px-4 py-2 font-semibold">{children}</th>;
          },
          td({ children }) {
            return (
              <td className="px-4 py-2 border-t border-zinc-800 text-zinc-300">{children}</td>
            );
          },
          hr() {
            return <hr className="border-zinc-800 my-6" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
