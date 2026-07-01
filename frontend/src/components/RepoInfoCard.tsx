"use client";

import { RepoInfo } from "@/types";
import { Star, GitFork, Calendar, Scale } from "lucide-react";

interface RepoInfoCardProps {
  info: RepoInfo;
}

export default function RepoInfoCard({ info }: RepoInfoCardProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{info.full_name}</h2>
          {info.description && (
            <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{info.description}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-zinc-500">
        {info.language && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-violet-500" />
            {info.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5" />
          {info.stars.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3.5 h-3.5" />
          {info.forks.toLocaleString()}
        </span>
        {info.license && (
          <span className="flex items-center gap-1">
            <Scale className="w-3.5 h-3.5" />
            {info.license}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(info.created_at).toLocaleDateString()}
        </span>
      </div>
      {info.topics && info.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {info.topics.slice(0, 6).map((topic) => (
            <span
              key={topic}
              className="px-2 py-0.5 bg-violet-900/30 text-violet-400 text-xs rounded-full border border-violet-800/50"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
