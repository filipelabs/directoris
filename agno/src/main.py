"""
directoris AgentOS - FastAPI application for AI story agents.

Real implementation using OpenRouter for LLM calls.
ContinuityAgent is implemented; other agents remain stubbed.
"""

import logging
from fastapi import FastAPI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agentos")

from .models import (
    AgentType,
    SceneAnalysisRequest,
    SceneAnalysisResponse,
    ShotSuggestionsRequest,
    ShotSuggestionsResponse,
)
from .tools.directoris import DirectorisClient
from .agents.continuity import run_continuity_agent


# ============ Application ============


app = FastAPI(
    title="directoris AgentOS",
    description="AI agents for story analysis and suggestions",
    version="0.1.0",
)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "directoris-agentos"}


@app.post("/agents/scene-analysis", response_model=SceneAnalysisResponse)
async def scene_analysis(request: SceneAnalysisRequest):
    """
    Run story agents on a scene.

    Fetches context from directoris internal API, runs requested agents,
    and returns structured outputs.
    """
    logger.info(f"scene-analysis: project={request.projectId} scene={request.sceneId} agents={request.agentTypes}")

    client = DirectorisClient()

    try:
        # Fetch context from directoris
        scene = await client.get_scene(request.sceneId)
        canon = await client.get_project_canon(request.projectId)
        all_scenes = await client.get_project_scenes(request.projectId)

        outputs = []

        # Run requested agents
        if AgentType.CONTINUITY in request.agentTypes:
            continuity_outputs = await run_continuity_agent(scene, canon, all_scenes)
            outputs.extend(continuity_outputs)
            logger.info(f"continuity: scene={request.sceneId} issues={len(continuity_outputs)}")

        # Other agents stay stubbed for now
        # if AgentType.STORY_STRUCTURE in request.agentTypes:
        #     structure_outputs = await run_structure_agent(scene, canon)
        #     outputs.extend(structure_outputs)

        # if AgentType.CHARACTER in request.agentTypes:
        #     character_outputs = await run_character_agent(scene, canon)
        #     outputs.extend(character_outputs)

        return SceneAnalysisResponse(outputs=outputs)
    except Exception as e:
        logger.error(f"scene-analysis failed: project={request.projectId} scene={request.sceneId} error={e}")
        raise
    finally:
        await client.close()


@app.post("/agents/shot-suggestions", response_model=ShotSuggestionsResponse)
async def shot_suggestions(request: ShotSuggestionsRequest):
    """
    Get cinematography suggestions for a scene.

    This is a stub implementation that returns empty suggestions.
    When ready to implement, use Agno storyboard agent to suggest shots.
    """
    # TODO: Implement real storyboard agent
    return ShotSuggestionsResponse(suggestions=[])
