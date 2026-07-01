import { FetchRepoResponse, AnalyzeResponse, BatchAnalyzeResponse, HealthResponse, AnalysisType } from "@/types";

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

export async function analyzeCodeStream(
  repoUrl: string,
  analysisType: AnalysisType,
  onChunk: (chunk: string) => void,
  onStatus?: (status: string) => void,
  onError?: (error: string) => void,
  onDone?: () => void
): Promise<void> {
  const res = await fetch(`${API_URL}/api/analyze-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl, analysis_type: analysisType }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Analysis failed");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.chunk) {
            onChunk(data.chunk);
          } else if (data.status && onStatus) {
            onStatus(data.status);
          } else if (data.error && onError) {
            onError(data.error);
          } else if (data.status === "done" && onDone) {
            onDone();
          }
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}

export async function analyzeBatch(
  repoUrl: string,
  analysisTypes: AnalysisType[]
): Promise<BatchAnalyzeResponse> {
  const res = await fetch(`${API_URL}/api/analyze-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl, analysis_types: analysisTypes }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Batch analysis failed");
  }
  return res.json();
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/api/health`);
  return res.json();
}
