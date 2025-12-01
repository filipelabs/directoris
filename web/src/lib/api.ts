// ═══════════════════════════════════════════════════════════════════════════
// DIRECTORIS API CLIENT
// Cookie-based auth with WorkOS
// ═══════════════════════════════════════════════════════════════════════════

import type {
  Session,
  Project,
  Act,
  Scene,
  Character,
  WorldRule,
  Location,
  AgentOutput,
  AgentType,
  CreateProjectDto,
  CreateActDto,
  CreateSequenceDto,
  CreateSceneDto,
  CreateCharacterDto,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
  const url = `${API_BASE}${path}`;
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
    window.location.href = `${API_BASE}/auth/login?screen_hint=${screenHint}`;
  },

  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),
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

  update: (id: string, data: Partial<CreateSceneDto>) =>
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

// ─── World Rules ───────────────────────────────────────────────────────────

export const rules = {
  list: (projectId: string) =>
    apiFetch<WorldRule[]>(`/projects/${projectId}/rules`),

  get: (id: string) => apiFetch<WorldRule>(`/rules/${id}`),
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
  rules,
  locations,
  agentOutputs,
};

export default api;
