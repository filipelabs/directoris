"""
OpenRouter LLM client wrapper.
Uses OpenAI-compatible API for simplicity.
"""

import os
from openai import AsyncOpenAI

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

MODEL = os.getenv("OPENROUTER_MODEL", "anthropic/claude-3.5-sonnet")


async def complete(system: str, user: str) -> str:
    """Simple completion wrapper for OpenRouter."""
    response = await client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.3,
    )
    return response.choices[0].message.content
