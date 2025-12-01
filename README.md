# directoris

> The director OS for AI-powered storytelling

A NestJS backend for managing story projects with AI-powered agents. Organize narratives from TV shows to LinkedIn content strategies using a unified story structure.

## Features

- **Multi-tenant Projects** - Role-based access (Owner, Editor, Viewer)
- **Story Structure** - Acts → Sequences → Scenes → Shots
- **Canon / Story Bible** - Characters, Locations, World Rules
- **Characters OS** - Arcs, Arc Beats, Facts, Relationships
- **AI Agents** - Continuity, story structure, and character analysis (stubbed, ready for LLM integration)
- **Auth** - WorkOS integration with session cookies

## Tech Stack

- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: WorkOS AuthKit
- **Docs**: Swagger/OpenAPI

## Quick Start

```bash
# Install dependencies
npm install

# Start PostgreSQL (Docker)
docker-compose up -d

# Run migrations
npx prisma migrate dev

# Start dev server
npm run start:dev
```

Server: http://localhost:3000
Swagger docs: http://localhost:3000/api/docs

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/directoris
WORKOS_API_KEY=sk_...
WORKOS_CLIENT_ID=client_...
WORKOS_COOKIE_PASSWORD=at-least-32-characters-long-secret
FRONTEND_URL=http://localhost:3000
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
- Membership management endpoints

### Canon
- Characters: `/projects/:projectId/characters`, `/characters/:id`
- Locations: `/projects/:projectId/locations`, `/locations/:id`
- World Rules: `/projects/:projectId/rules`, `/rules/:id`

### Characters OS
- Arcs: `/characters/:characterId/arcs`, `/arcs/:arcId`
- Arc Beats: `/arcs/:arcId/beats`, `/beats/:beatId`
- Facts: `/characters/:characterId/facts`, `/facts/:factId`
- Relationships: `/characters/:characterId/relationships`, `/relationships/:id`

### Story Structure
- Acts: `/projects/:projectId/acts`, `/acts/:id`
- Sequences: `/acts/:actId/sequences`, `/sequences/:id`
- Scenes: `/sequences/:sequenceId/scenes`, `/scenes/:id`
- Shots: `/scenes/:sceneId/shots`, `/shots/:id`

### AI Agents
- `POST /scenes/:sceneId/run-agents` - Run analysis agents
- `POST /scenes/:sceneId/shot-suggestions` - Get shot suggestions
- `GET /scenes/:sceneId/suggestions` - List suggestions
- `PATCH /agent-outputs/:id/resolve` - Mark resolved

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
