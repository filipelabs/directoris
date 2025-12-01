import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { InternalService } from './internal.service';
import { InternalApiKeyGuard } from './internal-api-key.guard';
import { Public } from '../common/decorators';

/**
 * Internal API endpoints for AgentOS.
 * These bypass user authentication and use API key auth instead.
 */
@ApiTags('internal')
@ApiHeader({
  name: 'X-AgentOS-Key',
  description: 'API key for AgentOS authentication',
  required: true,
})
@Controller('internal')
@Public() // Bypass global AuthGuard
@UseGuards(InternalApiKeyGuard) // Use API key guard instead
export class InternalController {
  constructor(private internalService: InternalService) {}

  @Get('scenes/:sceneId')
  @ApiOperation({
    summary: 'Get scene with full context',
    description:
      'Returns scene with sequence, act, project, characters, location, and shots',
  })
  getScene(@Param('sceneId') sceneId: string) {
    return this.internalService.getScene(sceneId);
  }

  @Get('projects/:projectId/canon')
  @ApiOperation({
    summary: 'Get project canon data',
    description: 'Returns characters, locations, and world rules for a project',
  })
  getProjectCanon(@Param('projectId') projectId: string) {
    return this.internalService.getProjectCanon(projectId);
  }

  @Get('characters/:characterId')
  @ApiOperation({
    summary: 'Get character with full details',
    description: 'Returns character with arcs, facts, and relationships',
  })
  getCharacter(@Param('characterId') characterId: string) {
    return this.internalService.getCharacter(characterId);
  }

  @Get('characters/:characterId/arcs')
  @ApiOperation({
    summary: 'Get character arcs',
    description: 'Returns character arcs with beats',
  })
  getCharacterArcs(@Param('characterId') characterId: string) {
    return this.internalService.getCharacterArcs(characterId);
  }

  @Get('projects/:projectId/scenes')
  @ApiOperation({
    summary: 'Get all scenes in project',
    description: 'Returns all scenes for continuity checks, ordered by act/sequence/scene index',
  })
  getProjectScenes(@Param('projectId') projectId: string) {
    return this.internalService.getProjectScenes(projectId);
  }
}
