"""
ContinuityAgent - Checks for story consistency issues.

Responsibilities:
- Check scene content vs world rules
- Verify character knowledge consistency
- Validate timeline coherence
- Flag location contradictions
"""


class ContinuityAgent:
    """
    Stub implementation of the Continuity Agent.

    When ready to implement with Agno:

    ```python
    from agno.agent import Agent
    from ..tools import get_scene, get_project_canon, get_character_facts

    continuity_agent = Agent(
        name="Continuity Supervisor",
        instructions='''
        You are a continuity supervisor for a long-running show.
        Check the current scene against:
        - World rules established in the project
        - Character knowledge (who knows what, and when)
        - Timeline consistency (events happen in logical order)
        - Location state (places that were destroyed, changed, etc.)

        Return structured issues with severity, title, content, and metadata.
        ''',
        tools=[get_scene, get_project_canon, get_character_facts],
    )
    ```
    """

    def __init__(self):
        pass

    async def analyze(self, scene_id: str, project_id: str) -> list[dict]:
        """
        Analyze a scene for continuity issues.

        Returns a list of issues found.
        """
        # TODO: Implement with Agno
        return []
