// ═══════════════════════════════════════════════════════════════════════════
// DIRECTORIS API CLIENT
// Cookie-based auth with WorkOS
// ═══════════════════════════════════════════════════════════════════════════

import type {
  Session,
  Project,
  Act,
  Sequence,
  Scene,
  Character,
  CharacterFact,
  CharacterRelationship,
  CharacterRelationshipsResponse,
  CharacterArc,
  CharacterArcBeat,
  WorldRule,
  Location,
  AgentOutput,
  AgentType,
  CreateProjectDto,
  CreateActDto,
  CreateSequenceDto,
  CreateSceneDto,
  UpdateSceneDto,
  CreateCharacterDto,
  CreateWorldRuleDto,
  CreateCharacterFactDto,
  UpdateCharacterFactDto,
  CreateCharacterRelationshipDto,
  UpdateCharacterRelationshipDto,
  CreateCharacterArcDto,
  UpdateCharacterArcDto,
  CreateCharacterArcBeatDto,
  UpdateCharacterArcBeatDto,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const API_PREFIX = "/api/v1";

// ─── Base Fetch ────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${API_PREFIX}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text || res.statusText);
  }

  // Handle empty responses
  const contentLength = res.headers.get("content-length");
  if (contentLength === "0" || res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const auth = {
  getSession: () => apiFetch<Session>("/auth/session"),

  login: (screenHint: "sign-in" | "sign-up" = "sign-in") => {
    window.location.href = `${API_BASE}${API_PREFIX}/auth/login?screen_hint=${screenHint}`;
  },

  logout: () => {
    const logoutUrl = `${API_BASE}${API_PREFIX}/auth/logout`;
    console.log('[API] Logging out, navigating to:', logoutUrl);
    console.log('[API] API_BASE:', API_BASE);
    window.location.href = logoutUrl;
  },
};

// ─── Projects ──────────────────────────────────────────────────────────────

export const projects = {
  list: () => apiFetch<Project[]>("/projects"),

  get: (id: string) => apiFetch<Project>(`/projects/${id}`),

  create: (data: CreateProjectDto) =>
    apiFetch<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateProjectDto>) =>
    apiFetch<Project>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/projects/${id}`, { method: "DELETE" }),
};

// ─── Acts ──────────────────────────────────────────────────────────────────

export const acts = {
  list: (projectId: string) =>
    apiFetch<Act[]>(`/projects/${projectId}/acts`),

  get: (id: string) => apiFetch<Act>(`/acts/${id}`),

  create: (projectId: string, data: CreateActDto) =>
    apiFetch<Act>(`/projects/${projectId}/acts`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateActDto>) =>
    apiFetch<Act>(`/acts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) => apiFetch<void>(`/acts/${id}`, { method: "DELETE" }),
};

// ─── Sequences ─────────────────────────────────────────────────────────────

export const sequences = {
  list: (actId: string) => apiFetch<Act[]>(`/acts/${actId}/sequences`),

  get: (id: string) => apiFetch<Act>(`/sequences/${id}`),

  create: (actId: string, data: CreateSequenceDto) =>
    apiFetch<Act>(`/acts/${actId}/sequences`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateSequenceDto>) =>
    apiFetch<Act>(`/sequences/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/sequences/${id}`, { method: "DELETE" }),
};

// ─── Scenes ────────────────────────────────────────────────────────────────

export const scenes = {
  list: (sequenceId: string) =>
    apiFetch<Scene[]>(`/sequences/${sequenceId}/scenes`),

  get: (id: string) => apiFetch<Scene>(`/scenes/${id}`),

  create: (sequenceId: string, data: CreateSceneDto) =>
    apiFetch<Scene>(`/sequences/${sequenceId}/scenes`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateSceneDto) =>
    apiFetch<Scene>(`/scenes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/scenes/${id}`, { method: "DELETE" }),

  // Agent operations
  runAgents: (sceneId: string, agentTypes?: AgentType[]) =>
    apiFetch<AgentOutput[]>(`/scenes/${sceneId}/run-agents`, {
      method: "POST",
      body: JSON.stringify({ agentTypes }),
    }),

  getSuggestions: (sceneId: string) =>
    apiFetch<AgentOutput[]>(`/scenes/${sceneId}/suggestions`),
};

// ─── Characters ────────────────────────────────────────────────────────────

export const characters = {
  list: (projectId: string) =>
    apiFetch<Character[]>(`/projects/${projectId}/characters`),

  get: (id: string) => apiFetch<Character>(`/characters/${id}`),

  create: (projectId: string, data: CreateCharacterDto) =>
    apiFetch<Character>(`/projects/${projectId}/characters`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateCharacterDto>) =>
    apiFetch<Character>(`/characters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/characters/${id}`, { method: "DELETE" }),
};

// ─── Character Facts ───────────────────────────────────────────────────────

export const facts = {
  list: (characterId: string) =>
    apiFetch<CharacterFact[]>(`/characters/${characterId}/facts`),

  create: (characterId: string, data: CreateCharacterFactDto) =>
    apiFetch<CharacterFact>(`/characters/${characterId}/facts`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (factId: string, data: UpdateCharacterFactDto) =>
    apiFetch<CharacterFact>(`/facts/${factId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (factId: string) =>
    apiFetch<void>(`/facts/${factId}`, { method: "DELETE" }),
};

// ─── Character Relationships ───────────────────────────────────────────────

export const relationships = {
  list: (characterId: string) =>
    apiFetch<CharacterRelationshipsResponse>(`/characters/${characterId}/relationships`),

  create: (characterId: string, data: CreateCharacterRelationshipDto) =>
    apiFetch<CharacterRelationship>(`/characters/${characterId}/relationships`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (relationshipId: string, data: UpdateCharacterRelationshipDto) =>
    apiFetch<CharacterRelationship>(`/relationships/${relationshipId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (relationshipId: string) =>
    apiFetch<void>(`/relationships/${relationshipId}`, { method: "DELETE" }),
};

// ─── Character Arcs ────────────────────────────────────────────────────────

export const arcs = {
  list: (characterId: string) =>
    apiFetch<CharacterArc[]>(`/characters/${characterId}/arcs`),

  get: (arcId: string) => apiFetch<CharacterArc>(`/arcs/${arcId}`),

  create: (characterId: string, data: CreateCharacterArcDto) =>
    apiFetch<CharacterArc>(`/characters/${characterId}/arcs`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (arcId: string, data: UpdateCharacterArcDto) =>
    apiFetch<CharacterArc>(`/arcs/${arcId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (arcId: string) =>
    apiFetch<void>(`/arcs/${arcId}`, { method: "DELETE" }),
};

// ─── Arc Beats ─────────────────────────────────────────────────────────────

export const beats = {
  list: (arcId: string) =>
    apiFetch<CharacterArcBeat[]>(`/arcs/${arcId}/beats`),

  create: (arcId: string, data: CreateCharacterArcBeatDto) =>
    apiFetch<CharacterArcBeat>(`/arcs/${arcId}/beats`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (beatId: string, data: UpdateCharacterArcBeatDto) =>
    apiFetch<CharacterArcBeat>(`/beats/${beatId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (beatId: string) =>
    apiFetch<void>(`/beats/${beatId}`, { method: "DELETE" }),
};

// ─── World Rules ───────────────────────────────────────────────────────────

export const rules = {
  list: (projectId: string) =>
    apiFetch<WorldRule[]>(`/projects/${projectId}/rules`),

  get: (id: string) => apiFetch<WorldRule>(`/rules/${id}`),

  create: (projectId: string, data: CreateWorldRuleDto) =>
    apiFetch<WorldRule>(`/projects/${projectId}/rules`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateWorldRuleDto>) =>
    apiFetch<WorldRule>(`/rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/rules/${id}`, { method: "DELETE" }),
};

// ─── Locations ─────────────────────────────────────────────────────────────

export const locations = {
  list: (projectId: string) =>
    apiFetch<Location[]>(`/projects/${projectId}/locations`),

  get: (id: string) => apiFetch<Location>(`/locations/${id}`),
};

// ─── Agent Outputs ─────────────────────────────────────────────────────────

export const agentOutputs = {
  resolve: (id: string, resolved: boolean = true) =>
    apiFetch<AgentOutput>(`/agent-outputs/${id}/resolve`, {
      method: "PATCH",
      body: JSON.stringify({ resolved }),
    }),
};

// ─── Export all ────────────────────────────────────────────────────────────

export const api = {
  auth,
  projects,
  acts,
  sequences,
  scenes,
  characters,
  facts,
  relationships,
  arcs,
  beats,
  rules,
  locations,
  agentOutputs,
};

export default api;
