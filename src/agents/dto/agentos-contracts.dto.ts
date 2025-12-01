import { AgentType, SuggestionSeverity, Prisma } from '../../generated/prisma';

/**
 * Contract DTOs for communication between NestJS and AgentOS.
 * These define the HTTP request/response shapes.
 */

// ============ Scene Analysis ============

/**
 * Request from NestJS to AgentOS for scene analysis
 */
export interface AgentOSSceneAnalysisRequest {
  projectId: string;
  sceneId: string;
  agentTypes: AgentType[];
  language?: string; // default 'en'
}

/**
 * Single output from an agent
 */
export interface AgentOSOutput {
  agentType: AgentType;
  severity: SuggestionSeverity;
  title: string;
  content: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Response from AgentOS for scene analysis
 */
export interface AgentOSSceneAnalysisResponse {
  outputs: AgentOSOutput[];
}

// ============ Shot Suggestions ============

/**
 * Request from NestJS to AgentOS for shot suggestions
 */
export interface AgentOSShotSuggestionsRequest {
  projectId: string;
  sceneId: string;
}

/**
 * Single shot suggestion from AgentOS
 */
export interface AgentOSShotSuggestion {
  type: string; // WIDE, CLOSE_UP, MEDIUM, OVER_THE_SHOULDER, etc.
  description: string;
  durationSec?: number;
  index?: number;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Response from AgentOS for shot suggestions
 */
export interface AgentOSShotSuggestionsResponse {
  suggestions: AgentOSShotSuggestion[];
}
