import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import {
  AgentType,
  ProjectRole,
  SuggestionSeverity,
} from '../generated/prisma';
import type {
  AgentOSSceneAnalysisRequest,
  AgentOSSceneAnalysisResponse,
  AgentOSOutput,
  AgentOSShotSuggestionsRequest,
  AgentOSShotSuggestionsResponse,
} from './dto';

// Stub data for realistic responses
interface StubSuggestion {
  severity: SuggestionSeverity;
  title: string;
  content: string;
  metadata: Record<string, string>;
}

const STUB_CONTINUITY_SUGGESTIONS: StubSuggestion[] = [
  {
    severity: SuggestionSeverity.WARNING,
    title: 'Character knowledge mismatch',
    content:
      'A character references information they should not know based on previous scenes. Review the scene order or add an exposition scene.',
    metadata: { type: 'knowledge_gap' },
  },
  {
    severity: SuggestionSeverity.INFO,
    title: 'Timeline consistency check passed',
    content:
      'All character movements and events appear consistent with the established timeline.',
    metadata: { type: 'timeline_ok' },
  },
  {
    severity: SuggestionSeverity.ERROR,
    title: 'Location contradiction',
    content:
      'This scene takes place at a location that was established as destroyed in Act 1.',
    metadata: { type: 'location_conflict' },
  },
];

const STUB_STRUCTURE_SUGGESTIONS: StubSuggestion[] = [
  {
    severity: SuggestionSeverity.INFO,
    title: 'Scene purpose is clear',
    content:
      'The scene effectively advances the plot by revealing a key character motivation.',
    metadata: { type: 'purpose_analysis' },
  },
  {
    severity: SuggestionSeverity.WARNING,
    title: 'Flat scene energy',
    content:
      'This scene lacks conflict or stakes. Consider adding an obstacle or time pressure.',
    metadata: { type: 'pacing_issue' },
  },
];

const STUB_CHARACTER_SUGGESTIONS: StubSuggestion[] = [
  {
    severity: SuggestionSeverity.WARNING,
    title: 'Voice inconsistency',
    content:
      "The dialogue in this scene doesn't match the character's established speech patterns from earlier scenes.",
    metadata: { type: 'voice_check' },
  },
  {
    severity: SuggestionSeverity.INFO,
    title: 'Arc progression detected',
    content:
      "This scene marks a turning point in the character's arc from resistance to acceptance.",
    metadata: { type: 'arc_beat' },
  },
];

const STUB_SHOT_SUGGESTIONS = [
  {
    type: 'WIDE',
    description: 'Establish the location with a wide shot showing the entire room.',
    durationSec: 3,
  },
  {
    type: 'MEDIUM',
    description: 'Two-shot of the main characters as they begin dialogue.',
    durationSec: 5,
  },
  {
    type: 'CLOSE_UP',
    description: "Close-up on the protagonist's reaction to the reveal.",
    durationSec: 2,
  },
  {
    type: 'OVER_THE_SHOULDER',
    description: 'Over-the-shoulder shot during the key exchange.',
    durationSec: 4,
  },
];

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);
  private readonly agentOsUrl: string | undefined;

  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private configService: ConfigService,
  ) {
    this.agentOsUrl = this.configService.get<string>('agentos.url');
    if (this.agentOsUrl) {
      this.logger.log(`AgentOS URL configured: ${this.agentOsUrl}`);
    } else {
      this.logger.log('AgentOS URL not configured, using stub responses');
    }
  }

  private async getProjectIdFromScene(sceneId: string): Promise<string> {
    const scene = await this.prisma.scene.findUnique({
      where: { id: sceneId },
      include: { sequence: { include: { act: true } } },
    });

    if (!scene) {
      throw new NotFoundException('Scene not found');
    }

    return scene.sequence.act.projectId;
  }

  async runAgents(
    sceneId: string,
    userId: string,
    agentTypes?: AgentType[],
  ) {
    const projectId = await this.getProjectIdFromScene(sceneId);

    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    const typesToRun = agentTypes?.length
      ? agentTypes
      : [
          AgentType.CONTINUITY,
          AgentType.STORY_STRUCTURE,
          AgentType.CHARACTER,
        ];

    // If AgentOS is configured, call it; otherwise use stubs
    if (this.agentOsUrl) {
      return this.callAgentOS(projectId, sceneId, typesToRun);
    }

    return this.generateStubSuggestions(projectId, sceneId, typesToRun);
  }

  /**
   * Call external AgentOS for scene analysis
   */
  private async callAgentOS(
    projectId: string,
    sceneId: string,
    agentTypes: AgentType[],
  ) {
    const request: AgentOSSceneAnalysisRequest = {
      projectId,
      sceneId,
      agentTypes,
    };

    try {
      const response = await fetch(`${this.agentOsUrl}/agents/scene-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        this.logger.error(
          `AgentOS returned ${response.status}: ${await response.text()}`,
        );
        // Fall back to stubs on error
        return this.generateStubSuggestions(projectId, sceneId, agentTypes);
      }

      const data: AgentOSSceneAnalysisResponse = await response.json();
      return this.saveAgentOutputs(projectId, sceneId, data.outputs);
    } catch (error) {
      this.logger.error(`Failed to call AgentOS: ${error}`);
      // Fall back to stubs on error
      return this.generateStubSuggestions(projectId, sceneId, agentTypes);
    }
  }

  /**
   * Save AgentOS outputs to database
   */
  private async saveAgentOutputs(
    projectId: string,
    sceneId: string,
    outputs: AgentOSOutput[],
  ) {
    const savedOutputs = [];

    for (const output of outputs) {
      const saved = await this.prisma.agentOutput.create({
        data: {
          agentType: output.agentType,
          projectId,
          sceneId,
          severity: output.severity,
          title: output.title,
          content: output.content,
          metadata: output.metadata,
        },
      });
      savedOutputs.push(saved);
    }

    return savedOutputs;
  }

  /**
   * Generate stub suggestions (fallback when AgentOS not available)
   */
  private async generateStubSuggestions(
    projectId: string,
    sceneId: string,
    agentTypes: AgentType[],
  ) {
    const outputs = [];

    for (const agentType of agentTypes) {
      let suggestions: StubSuggestion[] = [];

      switch (agentType) {
        case AgentType.CONTINUITY:
          suggestions = [
            STUB_CONTINUITY_SUGGESTIONS[
              Math.floor(Math.random() * STUB_CONTINUITY_SUGGESTIONS.length)
            ],
          ];
          break;
        case AgentType.STORY_STRUCTURE:
          suggestions = [
            STUB_STRUCTURE_SUGGESTIONS[
              Math.floor(Math.random() * STUB_STRUCTURE_SUGGESTIONS.length)
            ],
          ];
          break;
        case AgentType.CHARACTER:
          suggestions = [
            STUB_CHARACTER_SUGGESTIONS[
              Math.floor(Math.random() * STUB_CHARACTER_SUGGESTIONS.length)
            ],
          ];
          break;
      }

      for (const suggestion of suggestions) {
        const output = await this.prisma.agentOutput.create({
          data: {
            agentType,
            projectId,
            sceneId,
            severity: suggestion.severity,
            title: suggestion.title,
            content: suggestion.content,
            metadata: suggestion.metadata,
          },
        });
        outputs.push(output);
      }
    }

    return outputs;
  }

  async generateShotSuggestions(sceneId: string, userId: string) {
    const projectId = await this.getProjectIdFromScene(sceneId);

    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    // If AgentOS is configured, call it; otherwise use stubs
    if (this.agentOsUrl) {
      return this.callAgentOSForShots(projectId, sceneId);
    }

    // Return stub shot suggestions without saving them
    // User can review and accept individual shots
    return STUB_SHOT_SUGGESTIONS.map((shot, index) => ({
      ...shot,
      index,
      sceneId,
      suggested: true,
    }));
  }

  /**
   * Call external AgentOS for shot suggestions
   */
  private async callAgentOSForShots(projectId: string, sceneId: string) {
    const request: AgentOSShotSuggestionsRequest = {
      projectId,
      sceneId,
    };

    try {
      const response = await fetch(
        `${this.agentOsUrl}/agents/shot-suggestions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        },
      );

      if (!response.ok) {
        this.logger.error(
          `AgentOS shot-suggestions returned ${response.status}: ${await response.text()}`,
        );
        // Fall back to stubs
        return STUB_SHOT_SUGGESTIONS.map((shot, index) => ({
          ...shot,
          index,
          sceneId,
          suggested: true,
        }));
      }

      const data: AgentOSShotSuggestionsResponse = await response.json();
      return data.suggestions.map((shot, index) => ({
        ...shot,
        index,
        sceneId,
        suggested: true,
      }));
    } catch (error) {
      this.logger.error(`Failed to call AgentOS for shots: ${error}`);
      // Fall back to stubs
      return STUB_SHOT_SUGGESTIONS.map((shot, index) => ({
        ...shot,
        index,
        sceneId,
        suggested: true,
      }));
    }
  }

  async getSuggestionsByScene(sceneId: string, userId: string) {
    const projectId = await this.getProjectIdFromScene(sceneId);
    await this.projectsService.assertProjectAccess(projectId, userId);

    return this.prisma.agentOutput.findMany({
      where: { sceneId },
      orderBy: [{ resolved: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async resolveSuggestion(id: string, userId: string) {
    const output = await this.prisma.agentOutput.findUnique({
      where: { id },
    });

    if (!output) {
      throw new NotFoundException('Agent output not found');
    }

    await this.projectsService.assertProjectAccess(output.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.agentOutput.update({
      where: { id },
      data: { resolved: true },
    });
  }
}
