"""
ContinuityAgent - Checks for story consistency issues.

Responsibilities:
- Check scene content vs world rules
- Verify character knowledge consistency
- Validate timeline coherence
- Flag location contradictions
"""

import json
import logging
from typing import List
from ..llm import complete
from ..models import AgentOutput, AgentType, SuggestionSeverity

logger = logging.getLogger("agentos.continuity")

SYSTEM_PROMPT = """You are a continuity supervisor for a story project.

Analyze the scene for continuity issues:
1. World rule violations - does the scene break established rules?
2. Character knowledge gaps - do characters reference info they shouldn't know?
3. Timeline inconsistencies - do events contradict established order?
4. Fact contradictions - does the scene contradict character facts?

Return a JSON array of issues. Each issue has:
- severity: "INFO" | "WARNING" | "ERROR"
- title: short headline (max 50 chars)
- content: detailed explanation
- metadata: { characterName?, ruleTitle?, relatedSceneTitles? }

If no issues found, return empty array: []

IMPORTANT: Return ONLY valid JSON, no markdown or explanation."""


async def run_continuity_agent(
    scene: dict,
    canon: dict,
    all_scenes: list[dict],
) -> List[AgentOutput]:
    """
    Analyze scene for continuity issues.

    Args:
        scene: Full scene with characters, location, sequence context
        canon: Project canon (characters, locations, worldRules)
        all_scenes: All scenes in project for timeline context
    """
    # Build context for LLM
    user_prompt = build_context_prompt(scene, canon, all_scenes)

    # Call LLM
    response = await complete(SYSTEM_PROMPT, user_prompt)

    # Parse response
    try:
        issues = json.loads(response)
    except json.JSONDecodeError:
        # LLM didn't return valid JSON - log and return error
        logger.warning(f"JSON parse failed for scene={scene.get('id')}: {response[:200]}")
        return [AgentOutput(
            agentType=AgentType.CONTINUITY,
            severity=SuggestionSeverity.ERROR,
            title="Agent parsing error",
            content=f"Could not parse agent response: {response[:200]}",
            metadata={"raw_response": response},
        )]

    # Map to AgentOutput
    outputs = []
    for issue in issues:
        outputs.append(AgentOutput(
            agentType=AgentType.CONTINUITY,
            severity=SuggestionSeverity(issue.get("severity", "INFO")),
            title=issue.get("title", "Continuity issue"),
            content=issue.get("content", ""),
            metadata=issue.get("metadata"),
        ))

    return outputs


def build_context_prompt(scene: dict, canon: dict, all_scenes: list[dict]) -> str:
    """Build the user prompt with scene and canon context."""
    # Scene info (note: Scene has title, summary, purpose, tone - no 'content' field)
    location = scene.get('location') or {}
    chars = ', '.join(c['character']['name'] for c in scene.get('characters', [])) or 'None'
    scene_text = f"""
## Current Scene
Title: {scene.get('title', 'Untitled')}
Summary: {scene.get('summary', 'No summary')}
Purpose: {scene.get('purpose', 'Not specified')}
Tone: {scene.get('tone', 'Not specified')}
Location: {location.get('name', 'Unknown')}
Characters in scene: {chars}
"""

    # World rules (WorldRule has 'title' not 'name')
    rules_text = "## World Rules\n"
    for rule in canon.get('worldRules', []):
        rules_text += f"- {rule['title']}: {rule['description']}\n"

    # Character facts (for knowledge checking)
    facts_text = "## Character Facts\n"
    for char in canon.get('characters', []):
        if char.get('facts'):
            facts_text += f"\n### {char['name']}\n"
            for fact in char.get('facts', []):
                secret = " (SECRET)" if fact.get('isSecret') else ""
                facts_text += f"- {fact['label']}: {fact['value']}{secret}\n"

    # Previous scenes (for timeline)
    timeline_text = "## Previous Scenes (timeline order)\n"
    current_idx = next((i for i, s in enumerate(all_scenes) if s['id'] == scene['id']), 0)
    for s in all_scenes[:current_idx]:
        timeline_text += f"- {s.get('title', 'Untitled')}: {s.get('summary', '')}\n"

    return f"{scene_text}\n{rules_text}\n{facts_text}\n{timeline_text}"
