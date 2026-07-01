import os
from openai import AsyncOpenAI
from prompts import ANALYSIS_PROMPTS, ANALYSIS_TYPES


OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
MODEL_NAME = os.getenv("MODEL_NAME", "google/gemini-2.5-flash-preview")


def get_client() -> AsyncOpenAI:
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY not found in environment variables")
    return AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
    )


def format_file_contents(file_contents: dict) -> str:
    formatted = []
    for path, content in file_contents.items():
        formatted.append(f"\n--- FILE: {path} ---\n{content}\n--- END FILE: {path} ---\n")
    return "\n".join(formatted)


async def analyze_code(repo_name: str, file_contents: dict, analysis_type: str) -> str:
    if analysis_type not in ANALYSIS_PROMPTS:
        raise ValueError(f"Unknown analysis type: {analysis_type}. Valid types: {list(ANALYSIS_PROMPTS.keys())}")

    client = get_client()

    prompt_template = ANALYSIS_PROMPTS[analysis_type]
    formatted_files = format_file_contents(file_contents)

    readme_content = file_contents.get("README.md", file_contents.get("README", "No README found."))
    if analysis_type == "readme_improve":
        prompt = prompt_template.format(
            repo_name=repo_name,
            readme_content=readme_content,
            file_contents=formatted_files
        )
    else:
        prompt = prompt_template.format(
            repo_name=repo_name,
            file_contents=formatted_files
        )

    try:
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=8192,
        )
    except Exception as e:
        err_str = str(e)
        if "402" in err_str or "tokens" in err_str.lower() or "limit" in err_str.lower():
            raise ValueError("Repository is too large for the AI model's token limit. Try a smaller repository.")
        raise

    if response.choices and response.choices[0].message.content:
        return response.choices[0].message.content
    else:
        return "Analysis could not be completed. Please try again."
