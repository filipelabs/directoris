# directoris AgentOS

> AI agents for story analysis and suggestions

This is the Agno-based agent service for directoris. It provides AI-powered story analysis through a FastAPI server.

## Setup (for future implementation)

```bash
cd agno
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DIRECTORIS_API_URL=http://localhost:3000
DIRECTORIS_API_KEY=your-secret-key-here
```

## Running

```bash
uvicorn src.main:app --reload --port 8000
```

## Endpoints

- `POST /agents/scene-analysis` - Run story agents on a scene
- `POST /agents/shot-suggestions` - Get cinematography suggestions
- `GET /health` - Health check

## Agent Responsibilities

### 1. ContinuityAgent (CONTINUITY)

Checks for story consistency issues:
- Scene content vs world rules
- Character knowledge consistency (who knows what, and when)
- Timeline coherence (events happen in logical order)
- Location contradictions

**Tools used:**
- `get_scene(scene_id)` - Get full scene context
- `get_project_canon(project_id)` - Get characters, locations, world rules
- `get_character_facts(character_id)` - Get character knowledge/secrets

### 2. StructureAgent (STORY_STRUCTURE)

Analyzes scene purpose and pacing:
- Scene purpose within sequence/act
- Presence of conflict, turn, outcome
- Pacing evaluation
- Story beat identification

**Tools used:**
- `get_scene_with_context(scene_id)` - Scene with sequence and act
- `list_scenes_in_sequence(sequence_id)` - All scenes for context

### 3. CharacterAgent (CHARACTER)

Validates character consistency:
- Voice and dialogue patterns
- Actions fit arc progression
- Relationship dynamics
- Motivation alignment

**Tools used:**
- `get_character(character_id)` - Full character data
- `get_character_arcs(character_id)` - Character arcs with beats
- `get_character_relationships(character_id)` - Relationship graph

### 4. StoryboardAgent (STORYBOARD)

Suggests cinematography:
- Shot types (WIDE, CLOSE_UP, MEDIUM, etc.)
- Shot ordering and pacing
- Visual storytelling recommendations

**Tools used:**
- `get_scene_summary(scene_id)` - Scene content
- `list_shots(scene_id)` - Existing shots to refine

## Data Contracts

### Scene Analysis Request

```json
{
  "projectId": "proj_123",
  "sceneId": "scene_456",
  "agentTypes": ["CONTINUITY", "STORY_STRUCTURE", "CHARACTER"],
  "language": "en"
}
```

### Scene Analysis Response

```json
{
  "outputs": [
    {
      "agentType": "CONTINUITY",
      "severity": "WARNING",
      "title": "Character knowledge mismatch",
      "content": "Alice references the rebellion, but she has never been present in scenes where it was revealed.",
      "metadata": {
        "characterId": "char_123",
        "relatedSceneIds": ["scene_010", "scene_014"]
      }
    }
  ]
}
```

### Shot Suggestions Request

```json
{
  "projectId": "proj_123",
  "sceneId": "scene_456"
}
```

### Shot Suggestions Response

```json
{
  "suggestions": [
    {
      "type": "WIDE",
      "description": "Establish the location with a wide shot showing the entire room.",
      "durationSec": 3
    }
  ]
}
```

## Architecture

```
agno/
├── src/
│   ├── main.py           # FastAPI application
│   ├── agents/           # Agent implementations
│   │   ├── continuity.py
│   │   ├── structure.py
│   │   ├── character.py
│   │   └── storyboard.py
│   └── tools/            # directoris API client
│       └── directoris.py
├── requirements.txt
├── pyproject.toml
└── .env.example
```

## Future: Agno Integration

When ready to implement real agents, use the Agno framework:

```python
from agno.agent import Agent
from .tools import get_scene, get_project_canon

continuity_agent = Agent(
    name="Continuity Supervisor",
    instructions="Check the scene for continuity issues...",
    tools=[get_scene, get_project_canon],
)
```

See [Agno documentation](https://github.com/agno-agi/agno) for details.
