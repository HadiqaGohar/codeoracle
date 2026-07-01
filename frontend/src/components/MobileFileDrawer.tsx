"use client";

import { useState } from "react";
import { FolderTree, X } from "lucide-react";
import FileTree from "./FileTree";
import { FileItem } from "@/types";

interface MobileFileDrawerProps {
  files: FileItem[];
}

export default function MobileFileDrawer({ files }: MobileFileDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-full shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition-colors"
      >
        <FolderTree className="w-5 h-5" />
        <span className="text-sm font-medium">Files</span>
      </button>

      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-zinc-950 border-r border-zinc-800 shadow-2xl transform transition-transform duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white">File Explorer</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-3rem)]">
              <FileTree files={files} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
