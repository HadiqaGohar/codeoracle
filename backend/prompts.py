ANALYSIS_PROMPTS = {
    "code_explain": """You are a senior software engineer. Analyze the following repository code and provide a detailed explanation.

For each major file/module, explain:
1. **Purpose** - What does this file do?
2. **Key Functions/Classes** - List important functions and classes with their roles
3. **Data Flow** - How data moves through this code
4. **Dependencies** - What external libraries/modules are used
5. **Entry Points** - Where does execution start?

Format your response in clean Markdown with headers, code blocks, and bullet points.

Repository: {repo_name}
Files:
{file_contents}""",

    "bug_detection": """You are an expert code reviewer specializing in bug detection. Analyze the following repository code for potential bugs.

Look for:
1. **Logic Errors** - Incorrect conditions, off-by-one errors, wrong operators
2. **Null/Undefined Handling** - Missing null checks, undefined access
3. **Edge Cases** - Empty arrays, boundary values, division by zero
4. **Race Conditions** - Async issues, timing problems
5. **Type Errors** - Wrong types, implicit conversions
6. **Memory Issues** - Leaks, unbounded growth
7. **Error Handling** - Missing try-catch, swallowed errors

For each bug found, provide:
- File and line reference
- Description of the bug
- Severity (Critical/High/Medium/Low)
- Suggested fix with code

Repository: {repo_name}
Files:
{file_contents}""",

    "readme_improve": """You are a technical writer. Analyze the existing README (if any) and suggest improvements.

If no README exists, create a complete one from scratch.

Include:
1. **Project Title** - Clear, descriptive name
2. **Badges** - Build status, version, license
3. **Description** - What the project does (2-3 paragraphs)
4. **Features** - Key features list
5. **Prerequisites** - What's needed to run
6. **Installation** - Step-by-step setup guide
7. **Usage** - Code examples showing how to use
8. **API Reference** - If applicable, document APIs
9. **Contributing** - How to contribute
10. **License** - License info

Format as proper Markdown.

Repository: {repo_name}
Current README:
{readme_content}

Files:
{file_contents}""",

    "architecture": """You are a software architect. Analyze the repository and create a comprehensive architecture overview.

Generate:
1. **Architecture Diagram** in Mermaid syntax showing:
   - Main modules/components
   - Dependencies between them
   - Data flow direction
   - External services/APIs

2. **Component Breakdown**:
   - List each major component
   - Its responsibility
   - How it interacts with others

3. **Patterns Used** - Design patterns observed (MVC, Observer, Factory, etc.)

4. **Tech Stack** - All technologies, frameworks, libraries used

5. **Project Structure** - Recommended directory structure explanation

Use Mermaid diagram syntax like:
```mermaid
graph TD
    A[Component] --> B[Component]
    A --> C[Component]
```

Repository: {repo_name}
Files:
{file_contents}""",

    "documentation": """You are a documentation expert. Generate comprehensive documentation for the codebase.

Include:
1. **Project Overview** - High-level description
2. **Module Documentation** - For each module/file:
   - Purpose
   - Public API (functions, classes, methods)
   - Parameters and return types
   - Usage examples
3. **Configuration** - Environment variables, config files
4. **Setup Guide** - Development environment setup
5. **Deployment** - How to deploy the application
6. **Troubleshooting** - Common issues and solutions

Add inline comments and JSDoc/docstring suggestions where missing.

Format as clean Markdown with proper headers and code blocks.

Repository: {repo_name}
Files:
{file_contents}""",

    "refactoring": """You are a senior developer focused on code quality. Analyze the codebase and suggest refactoring improvements.

Look for:
1. **Code Smells** - Long methods, large classes, duplicated code
2. **SOLID Principles** - violations of Single Responsibility, Open/Closed, etc.
3. **DRY Violations** - Repeated logic that should be extracted
4. **Naming Issues** - Poor variable/function names
5. **Complexity** - Overly complex logic that can be simplified
6. **Dead Code** - Unused variables, unreachable code
7. **Magic Numbers** - Hardcoded values that should be constants

For each suggestion:
- Current code snippet
- Refactored code
- Explanation of improvement
- Impact on maintainability

Repository: {repo_name}
Files:
{file_contents}""",

    "security": """You are a cybersecurity expert. Analyze the repository for security vulnerabilities.

Check for:
1. **Hardcoded Secrets** - API keys, passwords, tokens in code
2. **SQL Injection** - Raw SQL queries without parameterization
3. **XSS Vulnerabilities** - Unsanitized user input in HTML
4. **CSRF Issues** - Missing CSRF protection
5. **Insecure Dependencies** - Known vulnerable packages
6. **Authentication Flaws** - Weak auth implementations
7. **Authorization Issues** - Missing access controls
8. **Data Exposure** - Sensitive data in logs/responses
9. **Input Validation** - Missing or weak validation
10. **Cryptography** - Weak algorithms, insecure random

For each vulnerability:
- Severity (Critical/High/Medium/Low/Info)
- File and location
- Description of the risk
- Remediation steps with code

Repository: {repo_name}
Files:
{file_contents}""",

    "code_smells": """You are a code quality expert specializing in anti-patterns and code smells. Perform a granular analysis of every file.

Detect these specific code smells:

1. **God Classes** - Classes >300 lines or >10 methods. List class name, file, line count.
2. **Long Methods** - Functions >50 lines. List function name, file, line count.
3. **Duplicate Code** - Similar code blocks across files. Show both snippets.
4. **Magic Numbers** - Hardcoded numeric literals without named constants. List each occurrence.
5. **Deep Nesting** - Code nested >4 levels deep. List file and line range.
6. **Complex Conditionals** - if/else chains >4 conditions. List each occurrence.
7. **Dead Code** - Unreferenced functions/variables. List each one.
8. **Feature Envy** - Methods that use other classes' data more than their own.
9. **Switch Statements** - Switch/case with >5 cases (replace with polymorphism).
10. **Lazy Classes** - Classes with <3 methods or <20 lines.

For EACH smell found:
- Type of smell
- File path and line range
- Code snippet (current)
- Severity (Critical/High/Medium/Low)
- How to fix it (suggestion)

Group results by file. Be thorough — scan every file.

Repository: {repo_name}
Files:
{file_contents}""",

    "migration": """You are a senior software engineer specializing in framework migrations. Analyze the codebase and generate a complete migration guide.

Target framework: {target_framework}

For each file that needs changes:
1. **File path** - Which file needs migration
2. **Current code** - The code that needs to change
3. **Migrated code** - The equivalent code in the target framework
4. **Explanation** - Why this change is needed

Also provide:
- **Migration Overview** - High-level summary of all changes needed
- **Dependency Changes** - What packages to remove/add (old → new)
- **Breaking Changes** - List all breaking changes with workarounds
- **Step-by-step Guide** - Ordered migration steps
- **Testing Checklist** - What to verify after migration

Be thorough — cover every file that needs changes. Provide complete code, not snippets.

Repository: {repo_name}
Files:
{file_contents}""",

    "test_gaps": """You are a test engineer specializing in test coverage analysis. Analyze the codebase to find untested functions and generate test cases.

First, identify:
1. **Test Files** - Find all test files (test_*.py, *.test.ts, *.spec.ts, *_test.go, etc.)
2. **Source Files** - Find all non-test source files
3. **Test Coverage Gaps** - Functions/classes that have NO corresponding test

For each untested function:
- File path and function name
- Function signature
- Why it should be tested (complexity, risk, public API)
- Suggested test case with code (use the project's test framework)

Also provide:
- **Coverage Summary** - X/Y functions tested (Z% coverage)
- **Critical Gaps** - Most important functions to test first
- **Test Framework Detection** - Which test framework the project uses (pytest, jest, go test, etc.)
- **Missing Test Infrastructure** - If no tests exist, suggest how to set up testing

Generate actual test code for the top 5 most critical untested functions.

Repository: {repo_name}
Files:
{file_contents}"""
}

ANALYSIS_TYPES = {
    "code_explain": "Code Explanation",
    "bug_detection": "Bug Detection",
    "readme_improve": "README Improvement",
    "architecture": "Architecture Diagram",
    "documentation": "Documentation Generation",
    "refactoring": "Refactoring Suggestions",
    "security": "Security Analysis",
    "code_smells": "Code Smell Detector"
}
