"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, HelpCircle, Info, Send, Trash2, ChevronDown } from "lucide-react";

type Tab = "faq" | "about" | "chat";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const FAQ_DATA = [
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
    q: "What analysis types are available?",
    a: "CodeOracle supports 8 analysis types: Code Explanation, Bug Detection, README Improvement, Architecture Diagram, Documentation Generation, Refactoring Suggestions, Security Analysis, and Code Smell Detector.",
  },
  {
    q: "Can I analyze private repos?",
    a: "CodeOracle analyzes public GitHub repositories. For private repos, you can configure a GitHub token in the backend settings to enable access.",
  },
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
    q: "Does CodeOracle support languages other than JavaScript/Python?",
    a: "Yes! CodeOracle can analyze any language — Go, Rust, Java, Ruby, C++, and more. The AI understands all major programming languages.",
  },
  {
    q: "How does the Browser Extension work?",
    a: "The Chrome extension adds an 'Analyze with CodeOracle' button directly on GitHub repository pages. Click it to instantly open CodeOracle with that repo pre-loaded.",
  },
  {
    q: "Can I use CodeOracle's API programmatically?",
    a: "Yes! Generate an API key from the API section and use our REST API to integrate CodeOracle into your own tools and workflows. All 8 analysis types are available via API.",
  },
];

const ABOUT_CONTENT = {
  title: "About CodeOracle",
  tagline: "AI-Powered Repository Analyzer",
  description:
    "CodeOracle is an open-source tool that uses AI to analyze GitHub repositories. It provides instant insights into code quality, security vulnerabilities, architecture, and more.",
  features: [
    "8 AI-powered analysis types",
    "Real-time streaming responses",
    "File Complexity Heatmap",
    "Chat with Repo (AI chatbot)",
    "Repo Timeline & Growth Charts",
    "Migration Assistant",
    "Test Coverage Gap Finder",
    "Contributor Insights & Bus Factor",
    "Slack/Discord Webhook Notifications",
    "Public API for developers",
    "Team Workspaces",
    "Chrome Browser Extension",
  ],
  tech: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Python FastAPI", "Google Gemini AI"],
  author: "Hadiqa Gohar",
  github: "https://github.com/HadiqaGohar/codeoracle",
};

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
  const [activeTab, setActiveTab] = useState<Tab>("faq");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      inputRef.current?.focus();
    }
  }, [isOpen, activeTab]);

  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes("what is codeoracle") || q.includes("what's codeoracle") || q.includes("about")) {
      return "CodeOracle is a free AI-powered GitHub repository analyzer. Paste any repo URL and get instant code explanation, bug detection, security analysis, architecture diagrams, and more — all powered by Google Gemini AI. It supports 8 analysis types and includes features like real-time streaming, complexity heatmaps, and chat with repo.";
    }
    if (q.includes("how") && (q.includes("use") || q.includes("analyze") || q.includes("start"))) {
      return "It's simple!\n\n1. Go to the Analyze page\n2. Paste a GitHub repository URL\n3. Select an analysis type (Code Explanation, Bug Detection, Security, etc.)\n4. Click Analyze\n\nResults stream in real-time. You can also click 'Run All' to run all 8 analyses at once!";
    }
    if (q.includes("analysis type") || q.includes("feature") || q.includes("can it")) {
      return "CodeOracle supports 8 analysis types:\n\n• Code Explanation — Understand what each file does\n• Bug Detection — Find potential bugs and issues\n• Security Analysis — Detect vulnerabilities\n• Architecture Diagram — Visual Mermaid diagrams\n• Refactoring Suggestions — Code improvement tips\n• Documentation Generation — Auto-generate docs\n• README Improvement — Create/improve README\n• Code Smell Detector — Find anti-patterns\n\nPlus: Heatmap, Chat with Repo, Timeline, Migration Assistant, and more!";
    }
    if (q.includes("free") || q.includes("price") || q.includes("cost") || q.includes("plan")) {
      return "Yes, CodeOracle is free! The Free tier includes 5 analyses per day with all basic features. For unlimited analyses, custom prompts, and premium features, check our Pro plan at $12/month on the Pricing page.";
    }
    if (q.includes("heatmap") || q.includes("complexity")) {
      return "The File Complexity Heatmap color-codes your repository's file tree based on code complexity. Files are scored on lines, functions, nesting depth, magic numbers, and comment ratio.\n\n• Red = High complexity (needs attention)\n• Yellow = Medium complexity\n• Green = Low/Minimal complexity\n\nIt helps you instantly see which files need refactoring!";
    }
    if (q.includes("chat") && (q.includes("repo") || q.includes("repository"))) {
      return "The Chat with Repo feature lets you have a conversation about your codebase! After analyzing a repo, click the chat icon (💬) in the analysis toolbar. Ask follow-up questions like:\n\n• 'Where is this function used?'\n• 'What are the main dependencies?'\n• 'Explain the data flow'\n\nThe AI has full context of your repository files.";
    }
    if (q.includes("api") || q.includes("programmatic") || q.includes("integrate")) {
      return "Yes! CodeOracle has a public API. Click the 'API' button in the analysis toolbar to:\n\n1. Generate your API key\n2. Use the REST API endpoints:\n   • POST /api/analyze — Single analysis\n   • POST /api/analyze-stream — Streaming (SSE)\n   • POST /api/complexity — Complexity heatmap\n   • POST /api/chat — Chat with repo\n   • POST /api/timeline — Repo timeline\n\nAll endpoints accept JSON with your API key.";
    }
    if (q.includes("migrate") || q.includes("migration") || q.includes("convert")) {
      return "The Migration Assistant generates a complete migration guide! Click the 'Migrate' button, select your target framework (FastAPI, Django, Express, Next.js, etc.), and get:\n\n• Step-by-step migration guide\n• File-by-file code conversion\n• Dependency changes\n• Breaking changes list\n• Testing checklist\n\nCurrently supports: Flask, Django, Express, Next.js, NestJS, Gin, Spring Boot, Rails, Laravel.";
    }
    if (q.includes("test") && (q.includes("gap") || q.includes("coverage"))) {
      return "The Test Coverage Gap Finder scans your codebase to find:\n\n• Which functions have NO tests\n• Your test framework (pytest, jest, go test, etc.)\n• Coverage percentage\n• AI-generated test cases for critical functions\n\nClick 'Test Gaps' in the analysis toolbar to run it!";
    }
    if (q.includes("contributor") || q.includes("bus factor")) {
      return "Contributor Insights shows:\n\n• Bus Factor — How many people hold critical knowledge\n• Risk Level — Critical/High/Medium/Low\n• Top Contributors — Who commits the most\n• Code Frequency — Recent additions/deletions\n\nA bus factor of 1-2 means the project is at risk if a key contributor leaves.";
    }
    if (q.includes("webhook") || q.includes("slack") || q.includes("discord") || q.includes("notification")) {
      return "You can get notifications when analysis completes! Click the 'Webhook' button and paste a Slack or Discord webhook URL. When analysis finishes, you'll get a rich embed notification with:\n\n• Repository name\n• Analysis type\n• Quality score (if available)\n\nGreat for team workflows!";
    }
    if (q.includes("extension") || q.includes("browser") || q.includes("chrome")) {
      return "The CodeOracle Browser Extension adds an 'Analyze with CodeOracle' button directly on GitHub repository pages.\n\nInstallation:\n1. Go to chrome://extensions/\n2. Enable Developer mode\n3. Load the extension/ folder\n4. Visit any GitHub repo — the button appears automatically!\n\nOne click opens CodeOracle with that repo pre-loaded.";
    }
    if (q.includes("team") || q.includes("workspace") || q.includes("share")) {
      return "Team Workspaces let you share analyses with your team!\n\n1. Create a workspace with a name\n2. Add team members by email\n3. Share analysis results in the workspace\n\nGreat for code reviews and collaborative analysis. Click 'Teams' in the analysis toolbar.";
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return "Hello! I'm CodeOracle AI, here to help you understand and analyze code repositories. You can ask me about:\n\n• How to use CodeOracle\n• Available analysis types\n• Features like Heatmap, Chat, Migration\n• API access and integrations\n\nWhat would you like to know?";
    }
    if (q.includes("thank")) {
      return "You're welcome! If you have any more questions about CodeOracle, feel free to ask. Happy coding!";
    }

    return "I can help you with questions about CodeOracle! Try asking about:\n\n• What is CodeOracle?\n• How to analyze a repository\n• Available analysis types\n• Code Quality Score\n• File Complexity Heatmap\n• Migration Assistant\n• API access\n• Browser Extension\n\nOr type your question and I'll do my best to help!";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getAIResponse(userMsg.content);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(), 100);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setActiveTab("chat");
  };

  const handleClose = () => {
    setIsOpen(false);
    setExpandedFaq(null);
  };

  return (
    <>
      <button
        id="chatbot-faq"
        onClick={() => { setIsOpen(true); setActiveTab("faq"); }}
        className="hidden"
      />
      <button
        id="chatbot-about"
        onClick={() => { setIsOpen(true); setActiveTab("about"); }}
        className="hidden"
      />

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
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
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
              {activeTab === "chat" && (
                <button
                  onClick={handleNewChat}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="New Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex border-b border-zinc-800">
            {([
              { id: "faq" as Tab, icon: HelpCircle, label: "FAQ" },
              { id: "about" as Tab, icon: Info, label: "About" },
              { id: "chat" as Tab, icon: MessageCircle, label: "Chat" },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-violet-400 border-b-2 border-violet-400 bg-violet-400/5"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === "faq" && (
              <div className="p-4 space-y-2">
                {FAQ_DATA.map((faq, i) => (
                  <div
                    key={i}
                    className="border border-zinc-800 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800/50 transition-colors"
                    >
                      <span className="font-medium pr-2">{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform ${
                          expandedFaq === i ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedFaq === i && (
                      <div className="px-3 pb-3 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-2">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "about" && (
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-2">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{ABOUT_CONTENT.title}</h3>
                  <p className="text-xs text-violet-400">{ABOUT_CONTENT.tagline}</p>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">{ABOUT_CONTENT.description}</p>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-300 mb-2">Features</h4>
                  <div className="space-y-1">
                    {ABOUT_CONTENT.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-500">
                        <span className="w-1 h-1 rounded-full bg-violet-500" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-300 mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {ABOUT_CONTENT.tech.map((t) => (
                      <span key={t} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-zinc-800">
                  <p className="text-[10px] text-zinc-600">
                    Built with ❤️ by <span className="text-zinc-400">{ABOUT_CONTENT.author}</span>
                  </p>
                  <a
                    href={ABOUT_CONTENT.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-violet-400 hover:text-violet-300"
                  >
                    View on GitHub →
                  </a>
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="flex flex-col h-full">
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
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                          msg.role === "user"
                            ? "bg-violet-600 text-white rounded-br-sm"
                            : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
                        }`}
                      >
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
                          className="text-[11px] px-2.5 py-1 bg-zinc-800 text-zinc-400 hover:text-violet-400 hover:bg-zinc-800/80 rounded-full transition-colors border border-zinc-700 hover:border-violet-500/30"
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
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
          </div>
        </div>
      )}
    </>
  );
}
