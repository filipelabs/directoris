"""
StoryboardAgent - Suggests cinematography for scenes.

Responsibilities:
- Suggest shot types (WIDE, CLOSE_UP, MEDIUM, etc.)
- Recommend shot ordering and pacing
- Provide visual storytelling suggestions
"""


class StoryboardAgent:
    """
    Stub implementation of the Storyboard Agent.

    When ready to implement with Agno:

    ```python
    from agno.agent import Agent
    from ..tools import get_scene_summary, list_shots

    storyboard_agent = Agent(
        name="Storyboard Director",
        instructions='''
        You are a cinematography consultant.
        For the given scene, suggest:
        - Opening shot to establish location/mood
        - Shot progression that follows the action
        - Close-ups for emotional beats
        - Coverage for dialogue exchanges
        - Duration estimates for each shot

        Consider visual storytelling principles and pacing.
        ''',
        tools=[get_scene_summary, list_shots],
    )
    ```
    """

    def __init__(self):
        pass

    async def suggest_shots(self, scene_id: str, project_id: str) -> list[dict]:
        """
        Generate shot suggestions for a scene.

        Returns a list of shot suggestions.
        """
        # TODO: Implement with Agno
        return []
