"""
directoris AgentOS - FastAPI application for AI story agents.

This is a stub implementation. When ready to implement real agents,
integrate with the Agno framework.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from enum import Enum
from typing import Optional


# ============ Enums (mirror Prisma schema) ============


class AgentType(str, Enum):
    CONTINUITY = "CONTINUITY"
    STORY_STRUCTURE = "STORY_STRUCTURE"
    CHARACTER = "CHARACTER"
    STORYBOARD = "STORYBOARD"


class SuggestionSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


# ============ Request/Response Models ============


class SceneAnalysisRequest(BaseModel):
    projectId: str
    sceneId: str
    agentTypes: list[AgentType]
    language: Optional[str] = "en"


class AgentOutput(BaseModel):
    agentType: AgentType
    severity: SuggestionSeverity
    title: str
    content: str
    metadata: Optional[dict] = None


class SceneAnalysisResponse(BaseModel):
    outputs: list[AgentOutput]


class ShotSuggestionsRequest(BaseModel):
    projectId: str
    sceneId: str


class ShotSuggestion(BaseModel):
    type: str
    description: str
    durationSec: Optional[int] = None
    metadata: Optional[dict] = None


class ShotSuggestionsResponse(BaseModel):
    suggestions: list[ShotSuggestion]


# ============ Application ============


app = FastAPI(
    title="directoris AgentOS",
    description="AI agents for story analysis and suggestions",
    version="0.0.1",
)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "directoris-agentos"}


@app.post("/agents/scene-analysis", response_model=SceneAnalysisResponse)
async def scene_analysis(request: SceneAnalysisRequest):
    """
    Run story agents on a scene.

    This is a stub implementation that returns empty outputs.
    When ready to implement, use Agno agents to analyze the scene
    by calling the directoris internal API.
    """
    # TODO: Implement real agent logic
    # 1. Fetch scene data from directoris API
    # 2. Run requested agents
    # 3. Return structured outputs

    return SceneAnalysisResponse(outputs=[])


@app.post("/agents/shot-suggestions", response_model=ShotSuggestionsResponse)
async def shot_suggestions(request: ShotSuggestionsRequest):
    """
    Get cinematography suggestions for a scene.

    This is a stub implementation that returns empty suggestions.
    When ready to implement, use Agno storyboard agent to suggest shots.
    """
    # TODO: Implement real storyboard agent

    return ShotSuggestionsResponse(suggestions=[])
