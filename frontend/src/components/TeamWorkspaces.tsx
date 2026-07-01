"use client";

import { useState } from "react";
import { Folder, Plus, Users, Loader2, UserPlus } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  owner: string;
  members: string[];
  analyses: any[];
  created_at: number;
}

interface TeamWorkspacesProps {
  userEmail?: string;
}

export default function TeamWorkspaces({ userEmail }: TeamWorkspacesProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newName, setNewName] = useState("");
  const [newMember, setNewMember] = useState("");
  const [selectedWs, setSelectedWs] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const createWorkspace = async () => {
    if (!newName || !userEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/workspaces/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, owner: userEmail }),
      });
      const ws = await res.json();
      setWorkspaces((prev) => [...prev, ws]);
      setNewName("");
    } catch {}
    setLoading(false);
  };

  const addMember = async (wsId: string) => {
    if (!newMember) return;
    try {
      await fetch(`${API_URL}/api/workspaces/add-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: wsId, member: newMember }),
      });
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === wsId ? { ...ws, members: [...ws.members, newMember] } : ws
        )
      );
      setNewMember("");
    } catch {}
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
        <Folder className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Team Workspaces</h3>
      </div>

      <div className="p-4 space-y-4">
        {userEmail && (
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New workspace name"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={createWorkspace}
              disabled={!newName || loading}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-700 rounded-lg transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Plus className="w-4 h-4 text-white" />}
            </button>
          </div>
        )}

        {!userEmail && (
          <p className="text-xs text-zinc-500 text-center py-4">
            Sign in to create and manage team workspaces
          </p>
        )}

        {workspaces.length > 0 && (
          <div className="space-y-2">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedWs === ws.id
                    ? "border-indigo-500/50 bg-indigo-500/10"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
                onClick={() => setSelectedWs(selectedWs === ws.id ? null : ws.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white font-medium">{ws.name}</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-zinc-500" />
                    <span className="text-[10px] text-zinc-500">{ws.members.length}</span>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-600 mt-1">
                  by {ws.owner} · {ws.analyses.length} analyses
                </div>

                {selectedWs === ws.id && (
                  <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={newMember}
                        onChange={(e) => setNewMember(e.target.value)}
                        placeholder="Add member email"
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addMember(ws.id);
                        }}
                        className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-xs"
                      >
                        <UserPlus className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ws.members.map((m) => (
                        <span key={m} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {workspaces.length === 0 && userEmail && (
          <div className="text-center py-6">
            <Folder className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-xs text-zinc-500">No workspaces yet. Create one to share analyses with your team.</p>
          </div>
        )}
      </div>
    </div>
  );
}
