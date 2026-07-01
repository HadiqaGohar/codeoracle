import os
from openai import AsyncOpenAI
from prompts import ANALYSIS_PROMPTS, ANALYSIS_TYPES


OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
LITELLM_API_KEY = os.getenv("LITELLM_API_KEY", "")
MODEL_NAME = os.getenv("MODEL_NAME", "google/gemini-3-flash-preview")
LITELLM_MODEL = os.getenv("LITELLM_MODEL", "gemini/gemini-3-flash-preview")


def get_openrouter_client() -> AsyncOpenAI:
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY not found in environment variables")
    return AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
    )


def get_litellm_client() -> AsyncOpenAI:
    if not LITELLM_API_KEY:
        raise ValueError("LITELLM_API_KEY not found in environment variables")
    return AsyncOpenAI(
        base_url="https://api.litellm.ai/v1",
        api_key=LITELLM_API_KEY,
    )


def format_file_contents(file_contents: dict) -> str:
    formatted = []
    for path, content in file_contents.items():
        formatted.append(f"\n--- FILE: {path} ---\n{content}\n--- END FILE: {path} ---\n")
    return "\n".join(formatted)


def build_prompt(repo_name: str, file_contents: dict, analysis_type: str) -> str:
    prompt_template = ANALYSIS_PROMPTS[analysis_type]
    formatted_files = format_file_contents(file_contents)
    readme_content = file_contents.get("README.md", file_contents.get("README", "No README found."))

    if analysis_type == "readme_improve":
        return prompt_template.format(
            repo_name=repo_name,
            readme_content=readme_content,
            file_contents=formatted_files
        )
    else:
        return prompt_template.format(
            repo_name=repo_name,
            file_contents=formatted_files
        )


async def call_openrouter(prompt: str) -> str:
    client = get_openrouter_client()
    response = await client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=8192,
    )
    if response.choices and response.choices[0].message.content:
        return response.choices[0].message.content
    return ""


async def call_litellm(prompt: str) -> str:
    client = get_litellm_client()
    response = await client.chat.completions.create(
        model=LITELLM_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=8192,
    )
    if response.choices and response.choices[0].message.content:
        return response.choices[0].message.content
    return ""


async def analyze_code(repo_name: str, file_contents: dict, analysis_type: str) -> str:
    if analysis_type not in ANALYSIS_PROMPTS:
        raise ValueError(f"Unknown analysis type: {analysis_type}. Valid types: {list(ANALYSIS_PROMPTS.keys())}")

    prompt = build_prompt(repo_name, file_contents, analysis_type)

    # Try OpenRouter first, fall back to litellm
    try:
        result = await call_openrouter(prompt)
        if result:
            return result
    except Exception as e:
        err_str = str(e).lower()
        if "402" in err_str or "429" in err_str or "tokens" in err_str or "limit" in err_str or "quota" in err_str:
            pass  # Fall through to litellm
        else:
            raise

    # Fallback to litellm
    if LITELLM_API_KEY:
        try:
            result = await call_litellm(prompt)
            if result:
                return result
        except Exception:
            pass

    return "Analysis could not be completed. Please try again."
