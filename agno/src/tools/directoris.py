"""
directoris API client for agent tools.

This module provides tools that agents can use to fetch data
from the directoris backend via the internal API.
"""

import os
import httpx
from typing import Optional


class DirectorisClient:
    """
    HTTP client for the directoris internal API.

    Usage:
        client = DirectorisClient()
        scene = await client.get_scene("scene_123")
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
    ):
        self.base_url = base_url or os.getenv("DIRECTORIS_API_URL", "http://localhost:3000")
        self.api_key = api_key or os.getenv("DIRECTORIS_API_KEY", "")
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={"X-AgentOS-Key": self.api_key},
            timeout=30.0,
        )

    async def close(self):
        """Close the HTTP client."""
        await self._client.aclose()

    async def get_scene(self, scene_id: str) -> dict:
        """
        Get scene with full context (sequence, act, project, characters, location).

        This is a tool that agents can use to understand the scene being analyzed.
        """
        response = await self._client.get(f"/internal/scenes/{scene_id}")
        response.raise_for_status()
        return response.json()

    async def get_project_canon(self, project_id: str) -> dict:
        """
        Get project canon data (characters, locations, world rules).

        Returns:
            {
                "characters": [...],
                "locations": [...],
                "worldRules": [...]
            }
        """
        response = await self._client.get(f"/internal/projects/{project_id}/canon")
        response.raise_for_status()
        return response.json()

    async def get_character(self, character_id: str) -> dict:
        """
        Get character with full details (arcs, facts, relationships).
        """
        response = await self._client.get(f"/internal/characters/{character_id}")
        response.raise_for_status()
        return response.json()

    async def get_character_arcs(self, character_id: str) -> list[dict]:
        """
        Get character arcs with beats.
        """
        response = await self._client.get(f"/internal/characters/{character_id}/arcs")
        response.raise_for_status()
        return response.json()

    async def get_project_scenes(self, project_id: str) -> list[dict]:
        """
        Get all scenes in project for continuity checks.

        Scenes are ordered by act/sequence/scene index.
        """
        response = await self._client.get(f"/internal/projects/{project_id}/scenes")
        response.raise_for_status()
        return response.json()


# ============ Agno Tool Wrappers ============
#
# When implementing with Agno, wrap the client methods as tools:
#
# from agno.tools import tool
#
# client = DirectorisClient()
#
# @tool
# def get_scene(scene_id: str) -> dict:
#     """Get scene with full context."""
#     import asyncio
#     return asyncio.run(client.get_scene(scene_id))
#
# @tool
# def get_project_canon(project_id: str) -> dict:
#     """Get project canon data."""
#     import asyncio
#     return asyncio.run(client.get_project_canon(project_id))
