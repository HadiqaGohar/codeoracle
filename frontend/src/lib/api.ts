import { FetchRepoResponse, AnalyzeResponse, HealthResponse, AnalysisType } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function fetchRepo(repoUrl: string): Promise<FetchRepoResponse> {
  const res = await fetch(`${API_URL}/api/fetch-repo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to fetch repository");
  }
  return res.json();
}

export async function analyzeCode(
  repoUrl: string,
  analysisType: AnalysisType
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl, analysis_type: analysisType }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Analysis failed");
  }
  return res.json();
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/api/health`);
  return res.json();
}
