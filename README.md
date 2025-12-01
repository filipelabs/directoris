# directoris

> The director OS for AI-powered storytelling

A full-stack application for managing story projects with AI-powered agents. Organize narratives from TV shows to LinkedIn content strategies using a unified story structure.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js :3001)                     │
│         Cinematic control room UI - dark, story-first           │
├─────────────────────────────────────────────────────────────────┤
│                    Backend (NestJS :3000)                       │
│              REST API + WorkOS Auth + Prisma ORM                │
├─────────────────────────────────────────────────────────────────┤
│                   AgentOS (FastAPI :8000)                       │
│            AI agents via OpenRouter (Gemini 3 Pro)              │
└─────────────────────────────────────────────────────────────────┘
```

## Features

- **Multi-tenant Projects** - Role-based access (Owner, Editor, Viewer)
- **Story Structure** - Acts → Sequences → Scenes → Shots
- **Canon / Story Bible** - Characters, Locations, World Rules
- **Characters OS** - Arcs, Arc Beats, Facts, Relationships
- **AI Agents** - Continuity analysis (world rule violations, timeline issues, character knowledge gaps)
- **Auth** - WorkOS integration with session cookies
- **Cinematic UI** - Dark control room aesthetic with three-pane layout

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js 16, React 19, Tailwind v4, Framer Motion |
| **Backend** | NestJS, TypeScript, Prisma ORM |
| **Database** | PostgreSQL |
| **Auth** | WorkOS AuthKit |
| **AI Agents** | Python/FastAPI, OpenRouter (Gemini 3 Pro) |
| **Docs** | Swagger/OpenAPI |

## Quick Start

```bash
# 1. Install dependencies
npm install
cd web && npm install
cd ../agno && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# 2. Start PostgreSQL
docker-compose up -d

# 3. Run migrations
npx prisma migrate dev

# 4. Start all services
npm run start:dev          # Backend :3000
cd web && npm run dev      # Frontend :3001
cd agno && uvicorn src.main:app --port 8000  # AgentOS :8000
```

**URLs:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Swagger docs: http://localhost:3000/api/docs
- AgentOS: http://localhost:8000

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/directoris
WORKOS_API_KEY=sk_...
WORKOS_CLIENT_ID=client_...
WORKOS_COOKIE_PASSWORD=at-least-32-characters-long-secret
FRONTEND_URL=http://localhost:3000
AGENTOS_URL=http://localhost:8000
AGENTOS_KEY=your-internal-api-key
```

### AgentOS (agno/.env)
```env
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=google/gemini-2.0-flash-001
DIRECTORIS_URL=http://localhost:3000
DIRECTORIS_INTERNAL_KEY=your-internal-api-key
```

### Frontend (web/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## API Overview

### Auth
- `GET /auth/login` - WorkOS login redirect
- `GET /auth/callback` - OAuth callback
- `POST /auth/logout` - Clear session
- `GET /auth/session` - Current session info

### Projects
- `POST /projects` - Create project
- `GET /projects` - List projects
- `GET /projects/:id` - Get project
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Story Structure
- Acts: `/projects/:projectId/acts`, `/acts/:id`
- Sequences: `/acts/:actId/sequences`, `/sequences/:id`
- Scenes: `/sequences/:sequenceId/scenes`, `/scenes/:id`
- Shots: `/scenes/:sceneId/shots`, `/shots/:id`

### Canon
- Characters: `/projects/:projectId/characters`, `/characters/:id`
- Locations: `/projects/:projectId/locations`, `/locations/:id`
- World Rules: `/projects/:projectId/rules`, `/rules/:id`

### Characters OS
- Arcs: `/characters/:characterId/arcs`, `/arcs/:arcId`
- Arc Beats: `/arcs/:arcId/beats`, `/beats/:beatId`
- Facts: `/characters/:characterId/facts`, `/facts/:factId`
- Relationships: `/characters/:characterId/relationships`

### AI Agents
- `POST /scenes/:sceneId/run-agents` - Run analysis agents
- `GET /scenes/:sceneId/suggestions` - List suggestions
- `PATCH /agent-outputs/:id/resolve` - Mark resolved

## UI Design

The frontend uses a cinematic "director's control room" aesthetic:

- **Colors**: Near-black base (#050712), electric violet accent (#7C5CFF)
- **Typography**: Syne (headings), DM Sans (body), JetBrains Mono (scene numbers)
- **Layout**: Three-pane master/detail
  - Pane A: Collapsible scene tree (ACT → SEQ → SCN)
  - Pane B: Scene detail with Overview/Content/Beats tabs
  - Pane C: Agent panel with severity-colored suggestion cards

## Use Cases

**TV Shows / Films**
- Act = Season or Act
- Sequence = Episode or Plotline
- Scene = Scene
- Characters with arcs, relationships, and facts

**Content Strategy (LinkedIn, etc.)**
- Act = Long-term phase (e.g., "Building directoris")
- Sequence = Recurring series (e.g., "Devlog", "Founder mindset")
- Scene = Individual post
- Characters = You, audience personas, products as entities
- World Rules = Brand principles, themes, tone

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.
