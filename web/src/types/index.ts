// ═══════════════════════════════════════════════════════════════════════════
// DIRECTORIS TYPES
// Matches Prisma schema from backend
// ═══════════════════════════════════════════════════════════════════════════

// ─── Enums ─────────────────────────────────────────────────────────────────

export type ProjectRole = "OWNER" | "EDITOR" | "VIEWER";

export type ShotType =
  | "WIDE"
  | "MEDIUM"
  | "CLOSE_UP"
  | "EXTREME_CLOSE_UP"
  | "POV"
  | "INSERT"
  | "OVER_THE_SHOULDER"
  | "TWO_SHOT";

export type AgentType =
  | "CONTINUITY"
  | "STORY_STRUCTURE"
  | "CHARACTER"
  | "STORYBOARD";

export type SuggestionSeverity = "INFO" | "WARNING" | "ERROR";

// ─── User ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  workosId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  user: User;
}

// ─── Project ───────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMembership {
  id: string;
  role: ProjectRole;
  userId: string;
  projectId: string;
  user?: User;
}

export interface ProjectWithMembership extends Project {
  memberships?: ProjectMembership[];
}

// ─── Story Structure ───────────────────────────────────────────────────────

export interface Act {
  id: string;
  index: number;
  title: string;
  synopsis: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  sequences?: Sequence[];
}

export interface Sequence {
  id: string;
  index: number;
  title: string;
  summary: string | null;
  actId: string;
  createdAt: string;
  updatedAt: string;
  scenes?: Scene[];
}

export interface Scene {
  id: string;
  index: number;
  title: string;
  summary: string | null;
  purpose: string | null;
  tone: string | null;
  sequenceId: string;
  locationId: string | null;
  createdAt: string;
  updatedAt: string;
  location?: Location;
  characters?: SceneCharacter[];
  shots?: Shot[];
  agentOutputs?: AgentOutput[];
}

export interface SceneCharacter {
  id: string;
  sceneId: string;
  characterId: string;
  character?: Character;
}

export interface Shot {
  id: string;
  index: number;
  type: ShotType;
  description: string;
  durationSec: number | null;
  sceneId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Canon ─────────────────────────────────────────────────────────────────

export interface Character {
  id: string;
  name: string;
  bio: string | null;
  archetype: string | null;
  voiceNotes: string | null;
  imageUrl: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  arcs?: CharacterArc[];
  facts?: CharacterFact[];
}

export interface CharacterArc {
  id: string;
  characterId: string;
  season: number | null;
  title: string;
  summary: string | null;
  startState: string | null;
  endState: string | null;
  createdAt: string;
  updatedAt: string;
  beats?: CharacterArcBeat[];
}

export interface CharacterArcBeat {
  id: string;
  arcId: string;
  sceneId: string | null;
  description: string;
  type: string | null;
  index: number;
}

export interface CharacterFact {
  id: string;
  characterId: string;
  label: string;
  value: string;
  isSecret: boolean;
  knownByIds: string[];
}

export interface CharacterRelationship {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  description: string | null;
  dynamic: string | null;
  from?: Character;
  to?: Character;
}

export interface Location {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorldRule {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Agent Outputs ─────────────────────────────────────────────────────────

export interface AgentOutputMetadata {
  characterName?: string;
  ruleTitle?: string;
  relatedSceneTitles?: string[];
}

export interface AgentOutput {
  id: string;
  agentType: AgentType;
  projectId: string;
  sceneId: string | null;
  shotId: string | null;
  severity: SuggestionSeverity;
  title: string;
  content: string;
  metadata: AgentOutputMetadata;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── API DTOs ──────────────────────────────────────────────────────────────

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface CreateActDto {
  index: number;
  title: string;
  synopsis?: string;
}

export interface CreateSequenceDto {
  index: number;
  title: string;
  summary?: string;
}

export interface CreateSceneDto {
  index: number;
  title: string;
  summary?: string;
  purpose?: string;
  tone?: string;
  locationId?: string;
}

export interface CreateCharacterDto {
  name: string;
  bio?: string;
  archetype?: string;
  voiceNotes?: string;
  imageUrl?: string;
}

export interface RunAgentsDto {
  agentTypes?: AgentType[];
}

export interface CreateWorldRuleDto {
  title: string;
  description: string;
  category?: string;
}

export interface CreateLocationDto {
  name: string;
  description?: string;
  imageUrl?: string;
}
