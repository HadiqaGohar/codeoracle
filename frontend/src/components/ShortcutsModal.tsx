"use client";

import { X, Keyboard } from "lucide-react";

const shortcuts = [
  { keys: ["Cmd", "K"], desc: "Focus search input" },
  { keys: ["1", "-", "7"], desc: "Switch analysis tab" },
  { keys: ["Cmd", "Enter"], desc: "Run current analysis" },
  { keys: ["?"], desc: "Show this help" },
  { keys: ["Esc"], desc: "Close modal" },
];

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div key={s.desc} className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((key, i) => (
                  <span key={i}>
                    <kbd className="px-2 py-1 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded text-zinc-300">
                      {key}
                    </kbd>
                    {i < s.keys.length - 1 && <span className="text-zinc-600 mx-0.5">+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
