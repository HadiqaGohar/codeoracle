"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Trash2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const QUICK_REPLIES = [
  "What is CodeOracle?",
  "How do I analyze a repo?",
  "What analysis types are available?",
  "Is it free?",
  "How does the Heatmap work?",
  "Can I use the API?",
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes("what is codeoracle") || q.includes("what's codeoracle") || q.includes("about")) {
      return "CodeOracle is a free AI-powered GitHub repository analyzer. Paste any repo URL and get instant code explanation, bug detection, security analysis, architecture diagrams, and more — all powered by Google Gemini AI.";
    }
    if (q.includes("how") && (q.includes("use") || q.includes("analyze") || q.includes("start"))) {
      return "It's simple!\n\n1. Go to the Analyze page\n2. Paste a GitHub repository URL\n3. Select an analysis type\n4. Click Analyze\n\nResults stream in real-time. You can also click 'Run All' to run all 8 analyses at once!";
    }
    if (q.includes("analysis type") || q.includes("feature") || q.includes("can it")) {
      return "CodeOracle supports 8 analysis types:\n\n• Code Explanation\n• Bug Detection\n• Security Analysis\n• Architecture Diagram\n• Refactoring Suggestions\n• Documentation Generation\n• README Improvement\n• Code Smell Detector\n\nPlus: Heatmap, Chat, Timeline, Migration Assistant, and more!";
    }
    if (q.includes("free") || q.includes("price") || q.includes("cost") || q.includes("plan")) {
      return "Yes, CodeOracle is free! The Free tier includes 5 analyses per day. For unlimited analyses, custom prompts, and premium features, check our Pro plan at $12/month on the Pricing page.";
    }
    if (q.includes("heatmap") || q.includes("complexity")) {
      return "The File Complexity Heatmap color-codes your file tree based on code complexity. Red = high complexity, yellow = medium, green = clean. It helps you instantly see which files need refactoring!";
    }
    if (q.includes("api") || q.includes("programmatic") || q.includes("integrate")) {
      return "Yes! CodeOracle has a public API. Click the 'API' button in the analysis toolbar to generate your key. Endpoints include /api/analyze, /api/complexity, /api/chat, /api/timeline, and more.";
    }
    if (q.includes("migrate") || q.includes("migration") || q.includes("convert")) {
      return "The Migration Assistant generates a complete migration guide! Click 'Migrate', select your target framework (FastAPI, Django, Express, etc.), and get step-by-step instructions with code.";
    }
    if (q.includes("chat") && (q.includes("repo") || q.includes("repository"))) {
      return "The Chat with Repo feature lets you ask follow-up questions about your codebase! Click the chat icon (💬) in the analysis toolbar. Ask things like 'Where is this function used?'";
    }
    if (q.includes("contributor") || q.includes("bus factor")) {
      return "Contributor Insights shows bus factor risk, top contributors, and code frequency. A bus factor of 1-2 means the project is at risk if a key contributor leaves.";
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return "Hello! I'm CodeOracle AI, here to help you understand and analyze code repositories. What would you like to know?";
    }
    if (q.includes("thank")) {
      return "You're welcome! If you have any more questions, feel free to ask. Happy coding!";
    }

    return "I can help you with questions about CodeOracle! Try asking about:\n\n• What is CodeOracle?\n• How to analyze a repository\n• Available analysis types\n• Code Quality Score\n• File Complexity Heatmap\n• Migration Assistant\n• API access\n\nOr type your question and I'll do my best to help!";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getAIResponse(userMsg.content);
      setMessages((prev) => [...prev, { role: "assistant", content: reply, timestamp: Date.now() }]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-110 transition-all flex items-center justify-center group"
          title="Chat with CodeOracle"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">CodeOracle</h3>
                <p className="text-[10px] text-white/70">AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setMessages([]); setInput(""); }}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="New Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-5 h-5 text-violet-400" />
                </div>
                <p className="text-sm text-zinc-400 mb-1">Ask me anything!</p>
                <p className="text-[10px] text-zinc-600">I know everything about CodeOracle</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
                }`}>
                  <div className="whitespace-pre-wrap break-words text-[13px]">{msg.content}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 px-3 py-2 rounded-xl rounded-bl-sm">
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

          {messages.length === 0 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => handleQuickReply(qr)}
                    className="text-[11px] px-2.5 py-1 bg-zinc-800 text-zinc-400 hover:text-violet-400 rounded-full transition-colors border border-zinc-700 hover:border-violet-500/30"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-zinc-800 p-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask about CodeOracle..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
