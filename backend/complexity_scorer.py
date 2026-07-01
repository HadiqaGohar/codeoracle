import re
from typing import Optional


def count_lines(content: str) -> int:
    return len(content.splitlines())


def count_functions(content: str) -> int:
    patterns = [
        r'\bdef\s+\w+',           # Python
        r'\bfunction\s+\w+',      # JavaScript
        r'\bconst\s+\w+\s*=\s*(?:async\s+)?\(',  # JS arrow/const function
        r'\blet\s+\w+\s*=\s*(?:async\s+)?\(',     # JS let function
        r'\bfunc\s+\w+',          # Go
        r'\bpub\s+fn\s+\w+',      # Rust
        r'\b(def|func|function|fn)\s+\w+',  # Generic
    ]
    count = 0
    for pattern in patterns:
        count += len(re.findall(pattern, content))
    return count


def count_classes(content: str) -> int:
    patterns = [
        r'\bclass\s+\w+',
        r'\binterface\s+\w+',
        r'\bstruct\s+\w+',
    ]
    count = 0
    for pattern in patterns:
        count += len(re.findall(pattern, content))
    return count


def max_nesting_depth(content: str) -> int:
    max_depth = 0
    current_depth = 0
    for char in content:
        if char in '({[':
            current_depth += 1
            max_depth = max(max_depth, current_depth)
        elif char in ')}]':
            current_depth = max(0, current_depth - 1)
    return max_depth


def count_magic_numbers(content: str) -> int:
    pattern = r'(?<![a-zA-Z_])\b(?:[2-9]|[1-9]\d{1,})\b(?![a-zA-Z_])'
    matches = re.findall(pattern, content)
    exclude = {'0', '1', '2', '10', '100', '1000'}
    return len([m for m in matches if m not in exclude])


def count_imports(content: str) -> int:
    patterns = [
        r'^import\s+',
        r'^from\s+.*import',
        r'^require\s*\(',
        r'^#include',
        r'^use\s+',
    ]
    count = 0
    for line in content.splitlines():
        stripped = line.strip()
        for pattern in patterns:
            if re.match(pattern, stripped):
                count += 1
                break
    return count


def count_comments(content: str) -> int:
    patterns = [
        r'^\s*#',
        r'^\s*//',
        r'^\s*/\*',
        r'^\s*\*',
    ]
    count = 0
    for line in content.splitlines():
        stripped = line.strip()
        for pattern in patterns:
            if re.match(pattern, stripped):
                count += 1
                break
    return count


def calculate_complexity(content: str, file_path: str) -> dict:
    lines = count_lines(content)
    functions = count_functions(content)
    classes = count_classes(content)
    nesting = max_nesting_depth(content)
    magic = count_magic_numbers(content)
    imports = count_imports(content)
    comments = count_comments(content)

    comment_ratio = comments / max(lines, 1)

    score = 0

    if lines > 500:
        score += 30
    elif lines > 200:
        score += 15
    elif lines > 100:
        score += 5

    if functions > 20:
        score += 25
    elif functions > 10:
        score += 15
    elif functions > 5:
        score += 5

    if classes > 5:
        score += 15
    elif classes > 3:
        score += 5

    if nesting > 6:
        score += 20
    elif nesting > 4:
        score += 10
    elif nesting > 3:
        score += 5

    if magic > 10:
        score += 15
    elif magic > 5:
        score += 10
    elif magic > 2:
        score += 5

    if comment_ratio < 0.05 and lines > 50:
        score += 10

    if imports > 15:
        score += 5

    score = min(score, 100)

    if score >= 70:
        level = "high"
        color = "#ef4444"
    elif score >= 40:
        level = "medium"
        color = "#f59e0b"
    elif score >= 20:
        level = "low"
        color = "#22c55e"
    else:
        level = "minimal"
        color = "#10b981"

    return {
        "score": score,
        "level": level,
        "color": color,
        "metrics": {
            "lines": lines,
            "functions": functions,
            "classes": classes,
            "max_nesting": nesting,
            "magic_numbers": magic,
            "imports": imports,
            "comment_ratio": round(comment_ratio, 2),
        }
    }


def analyze_repo_complexity(file_contents: dict) -> dict:
    results = {}
    for path, content in file_contents.items():
        if isinstance(content, str) and len(content) > 0:
            results[path] = calculate_complexity(content, path)

    scores = [r["score"] for r in results.values()]
    avg_score = sum(scores) / len(scores) if scores else 0

    return {
        "files": results,
        "average_score": round(avg_score, 1),
        "total_files": len(results),
    }
