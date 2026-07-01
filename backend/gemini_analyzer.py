import google.generativeai as genai
import os
from prompts import ANALYSIS_PROMPTS, ANALYSIS_TYPES


def configure_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    genai.configure(api_key=api_key)


def format_file_contents(file_contents: dict) -> str:
    formatted = []
    for path, content in file_contents.items():
        formatted.append(f"\n--- FILE: {path} ---\n{content}\n--- END FILE: {path} ---\n")
    return "\n".join(formatted)


async def analyze_code(repo_name: str, file_contents: dict, analysis_type: str) -> str:
    if analysis_type not in ANALYSIS_PROMPTS:
        raise ValueError(f"Unknown analysis type: {analysis_type}. Valid types: {list(ANALYSIS_PROMPTS.keys())}")

    configure_gemini()

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

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config=genai.GenerationConfig(
            temperature=0.3,
            max_output_tokens=8192,
        )
    )

    response = await model.generate_content_async(prompt)

    if response.text:
        return response.text
    else:
        return "Analysis could not be completed. Please try again."
