"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onFocusSearch?: () => void;
  onSwitchTab?: (index: number) => void;
  onRunAnalysis?: () => void;
  onToggleHelp?: () => void;
}

const TAB_KEYS = ["1", "2", "3", "4", "5", "6", "7"];

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      // Cmd+K / Ctrl+K → focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handlers.onFocusSearch?.();
        return;
      }

      // Skip other shortcuts if typing in input
      if (isInput) return;

      // ? → toggle help
      if (e.key === "?") {
        e.preventDefault();
        handlers.onToggleHelp?.();
        return;
      }

      // Cmd+Enter / Ctrl+Enter → run analysis
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handlers.onRunAnalysis?.();
        return;
      }

      // 1-7 → switch tabs
      if (TAB_KEYS.includes(e.key)) {
        const index = parseInt(e.key) - 1;
        handlers.onSwitchTab?.(index);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
