"""
Pydantic models for AgentOS request/response contracts.
Mirrors the TypeScript DTOs in NestJS.
"""

from pydantic import BaseModel
from enum import Enum
from typing import Optional


class AgentType(str, Enum):
    CONTINUITY = "CONTINUITY"
    STORY_STRUCTURE = "STORY_STRUCTURE"
    CHARACTER = "CHARACTER"
    STORYBOARD = "STORYBOARD"


class SuggestionSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


# ============ Scene Analysis ============


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


# ============ Shot Suggestions ============


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
