export interface RepoInfo {
  name: string;
  full_name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  default_branch: string;
  topics: string[];
  license: string;
  created_at: string;
  updated_at: string;
}

export interface FileItem {
  path: string;
  type: string;
  size: number;
}

export interface FetchRepoResponse {
  repo_info: RepoInfo;
  file_tree: FileItem[];
  file_contents: Record<string, string>;
  total_files: number;
  fetched_files: number;
}

export interface AnalyzeResponse {
  result: string;
  type: string;
  type_label: string;
  repo_info: RepoInfo;
}

export interface HealthResponse {
  status: string;
  gemini_configured: boolean;
  github_configured: boolean;
  available_analyses: string[];
}

export type AnalysisType =
  | "code_explain"
  | "bug_detection"
  | "readme_improve"
  | "architecture"
  | "documentation"
  | "refactoring"
  | "security";

export const ANALYSIS_LABELS: Record<AnalysisType, string> = {
  code_explain: "Code Explanation",
  bug_detection: "Bug Detection",
  readme_improve: "README Improvement",
  architecture: "Architecture Diagram",
  documentation: "Documentation",
  refactoring: "Refactoring",
  security: "Security Analysis",
};

export const ANALYSIS_ICONS: Record<AnalysisType, string> = {
  code_explain: "Code",
  bug_detection: "Bug",
  readme_improve: "FileText",
  architecture: "Network",
  documentation: "BookOpen",
  refactoring: "Wrench",
  security: "Shield",
};
