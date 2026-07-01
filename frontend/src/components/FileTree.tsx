"use client";

import { FileItem } from "@/types";
import { File, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";
import { cn, formatFileSize } from "@/lib/utils";

interface FileTreeProps {
  files: FileItem[];
}

interface TreeNodeProps {
  name: string;
  path: string;
  children?: TreeNodeProps[];
  size?: number;
  depth?: number;
}

function buildTree(files: FileItem[]): TreeNodeProps[] {
  const root: TreeNodeProps[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      const existing = current.find((n) => n.name === part);
      if (existing) {
        if (isFile) {
          existing.size = file.size;
        } else if (!existing.children) {
          existing.children = [];
        }
        current = existing.children || [];
      } else {
        const node: TreeNodeProps = {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          size: isFile ? file.size : undefined,
          children: isFile ? undefined : [],
        };
        current.push(node);
        if (!isFile) {
          current = node.children!;
        }
      }
    }
  }

  return root;
}

function TreeNode({ node, depth = 0 }: { node: TreeNodeProps; depth?: number }) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1 text-sm hover:bg-zinc-800/50 rounded transition-colors text-left group",
          hasChildren ? "cursor-pointer" : "cursor-default"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          isOpen ? (
            <FolderOpen className="w-4 h-4 text-violet-400 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-violet-400 shrink-0" />
          )
        ) : (
          <File className="w-4 h-4 text-zinc-500 shrink-0" />
        )}
        <span className="truncate text-zinc-300 group-hover:text-white">{node.name}</span>
        {!hasChildren && node.size !== undefined && (
          <span className="ml-auto text-[10px] text-zinc-600 shrink-0">
            {formatFileSize(node.size)}
          </span>
        )}
      </button>
      {isOpen &&
        hasChildren &&
        node.children!.map((child) => (
          <TreeNode key={child.path} node={child} depth={depth + 1} />
        ))}
    </div>
  );
}

export default function FileTree({ files }: FileTreeProps) {
  const tree = buildTree(files);

  return (
    <div className="text-sm">
      <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
        Files
      </div>
      <div className="py-1 max-h-[calc(100vh-20rem)] overflow-y-auto">
        {tree.map((node) => (
          <TreeNode key={node.path} node={node} />
        ))}
      </div>
    </div>
  );
}
