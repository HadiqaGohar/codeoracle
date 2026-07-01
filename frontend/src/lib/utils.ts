export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) {
    return { owner: match[1], repo: match[2].replace(".git", "") };
  }
  return null;
}

export function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return "FileType";
    case "js":
    case "jsx":
      return "FileType";
    case "py":
      return "FileCode";
    case "json":
      return "FileJson";
    case "md":
      return "FileText";
    case "css":
    case "scss":
      return "Palette";
    case "html":
      return "Globe";
    case "yml":
    case "yaml":
      return "Settings";
    default:
      return "File";
  }
}
