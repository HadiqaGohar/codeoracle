"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types";
import { chatWithRepo } from "@/lib/api";
import { MessageSquare, Send, X, Bot, User, Loader2 } from "lucide-react";

interface ChatPanelProps {
  repoUrl: string;
  repoName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({ repoUrl, repoName, isOpen, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await chatWithRepo(repoUrl, userMsg.content, messages);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : "Failed to get response"}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[400px] h-[500px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">Chat with Repo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">{repoName}</span>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">Ask anything about this codebase</p>
            <div className="mt-4 space-y-2">
              {["What does this project do?", "Where is the main entry point?", "What are the key dependencies?"].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="block w-full text-left px-3 py-2 text-xs text-zinc-400 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-violet-600/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3 h-3 text-violet-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-br-sm"
                  : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{msg.content}</div>
            </div>
            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-1">
                <User className="w-3 h-3 text-zinc-400" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-violet-600/20 flex items-center justify-center shrink-0">
              <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
            </div>
            <div className="bg-zinc-800 px-3 py-2 rounded-lg rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-zinc-800 p-3">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the code..."
            rows={1}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
