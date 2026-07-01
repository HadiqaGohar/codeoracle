"use client";

import { useState, useMemo } from "react";
import { FileComplexity } from "@/types";
import { ChevronRight, ChevronDown, Info } from "lucide-react";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  size?: number;
  children?: FileNode[];
}

interface FileComplexityHeatmapProps {
  files: { path: string; type: string; size: number }[];
  complexityData: Record<string, FileComplexity> | null;
  onSelectFile?: (path: string) => void;
  selectedFile?: string | null;
}

function buildTree(files: { path: string; type: string; size: number }[]): FileNode {
  const root: FileNode = { name: "/", path: "", type: "folder", children: [] };

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (!current.children) current.children = [];

      let existing = current.children.find((c) => c.name === part);

      if (isLast) {
        if (!existing) {
          current.children.push({
            name: part,
            path: file.path,
            type: file.type === "file" ? "file" : "folder",
            size: file.size,
          });
        }
      } else {
        if (!existing) {
          existing = { name: part, path: parts.slice(0, i + 1).join("/"), type: "folder", children: [] };
          current.children.push(existing);
        }
        current = existing;
      }
    }
  }

  function sortNodes(node: FileNode) {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "folder" ? -1 : 1;
      });
      node.children.forEach(sortNodes);
    }
  }
  sortNodes(root);

  return root;
}

function getComplexityColor(path: string, data: Record<string, FileComplexity> | null): string | null {
  if (!data) return null;
  const entry = data[path];
  if (!entry) return null;
  return entry.color;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TreeNode({
  node,
  depth,
  complexityData,
  onSelectFile,
  selectedFile,
  expandedFolders,
  toggleFolder,
}: {
  node: FileNode;
  depth: number;
  complexityData: Record<string, FileComplexity> | null;
  onSelectFile?: (path: string) => void;
  selectedFile?: string | null;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
}) {
  const isFolder = node.type === "folder";
  const isExpanded = expandedFolders.has(node.path);
  const color = !isFolder ? getComplexityColor(node.path, complexityData) : null;
  const entry = complexityData?.[node.path];

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-0.5 px-1 rounded cursor-pointer text-sm transition-colors ${
          selectedFile === node.path
            ? "bg-violet-600/20 text-violet-300"
            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
        }`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => {
          if (isFolder) {
            toggleFolder(node.path);
          } else if (onSelectFile) {
            onSelectFile(node.path);
          }
        }}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 shrink-0 text-zinc-500" />
            ) : (
              <ChevronRight className="w-3 h-3 shrink-0 text-zinc-500" />
            )}
            <span className="text-zinc-500">📁</span>
          </>
        ) : (
          <>
            <span className="w-3" />
            {color ? (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
                title={`Complexity: ${entry?.score}/100 (${entry?.level})`}
              />
            ) : (
              <span className="w-2 h-2 rounded-full shrink-0 bg-zinc-700" />
            )}
          </>
        )}
        <span className="truncate font-mono text-xs">{node.name}</span>
        {!isFolder && node.size !== undefined && (
          <span className="ml-auto text-[10px] text-zinc-600 shrink-0">{formatSize(node.size)}</span>
        )}
        {!isFolder && entry && (
          <span className="ml-1 text-[10px] text-zinc-600 shrink-0">{entry.score}</span>
        )}
      </div>
      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              complexityData={complexityData}
              onSelectFile={onSelectFile}
              selectedFile={selectedFile}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileComplexityHeatmap({
  files,
  complexityData,
  onSelectFile,
  selectedFile,
}: FileComplexityHeatmapProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([""]));
  const [showLegend, setShowLegend] = useState(false);

  const tree = useMemo(() => buildTree(files), [files]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allFolders = new Set<string>();
    const walk = (node: FileNode) => {
      if (node.type === "folder") {
        allFolders.add(node.path);
        node.children?.forEach(walk);
      }
    };
    tree.children?.forEach(walk);
    setExpandedFolders(allFolders);
  };

  const collapseAll = () => {
    setExpandedFolders(new Set());
  };

  const avgScore = complexityData
    ? Math.round(
        Object.values(complexityData).reduce((sum, f) => sum + f.score, 0) /
          Object.values(complexityData).length
      )
    : null;

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Complexity Heatmap</h3>
          {avgScore !== null && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: avgScore >= 70 ? "#ef444420" : avgScore >= 40 ? "#f59e0b20" : "#22c55e20",
                color: avgScore >= 70 ? "#ef4444" : avgScore >= 40 ? "#f59e0b" : "#22c55e",
              }}
            >
              Avg: {avgScore}/100
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="text-[10px] text-zinc-500 hover:text-zinc-300">
            Expand
          </button>
          <span className="text-zinc-700">|</span>
          <button onClick={collapseAll} className="text-[10px] text-zinc-500 hover:text-zinc-300">
            Collapse
          </button>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="p-1 text-zinc-500 hover:text-zinc-300"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>
      </div>

      {showLegend && (
        <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 space-y-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> High (70-100)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium (40-69)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Low (20-39)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Minimal (0-19)
            </span>
          </div>
          <p>Score based on: lines, functions, nesting depth, magic numbers, comments</p>
        </div>
      )}

      <div className="max-h-[400px] overflow-y-auto p-2">
        {complexityData ? (
          tree.children?.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={0}
              complexityData={complexityData}
              onSelectFile={onSelectFile}
              selectedFile={selectedFile}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))
        ) : (
          <div className="text-center py-8 text-zinc-500 text-sm">
            Loading complexity data...
          </div>
        )}
      </div>
    </div>
  );
}
