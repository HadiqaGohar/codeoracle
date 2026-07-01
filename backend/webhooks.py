import os
import httpx


async def send_webhook(webhook_url: str, repo_name: str, analysis_type: str, score: int | None = None):
    if not webhook_url:
        return

    embed = {
        "title": f"CodeOracle Analysis Complete",
        "description": f"**{analysis_type}** analysis finished for `{repo_name}`",
        "color": 0x8b5cf6,
        "fields": [
            {"name": "Repository", "value": repo_name, "inline": True},
            {"name": "Analysis", "value": analysis_type, "inline": True},
        ],
        "footer": {"text": "CodeOracle — Powered by Gemini AI"},
    }

    if score is not None:
        embed["fields"].append({"name": "Score", "value": f"{score}/100", "inline": True})

    payload = {"embeds": [embed]}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(webhook_url, json=payload)
    except Exception:
        pass
