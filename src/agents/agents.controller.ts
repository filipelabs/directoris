import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { RunAgentsDto } from './dto';
import { CurrentUser } from '../common/decorators';
import type { User } from '../generated/prisma';

@ApiTags('agents')
@ApiBearerAuth()
@Controller()
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @Post('scenes/:sceneId/run-agents')
  @ApiOperation({
    summary: 'Run AI agents on a scene',
    description:
      'Runs continuity, story structure, and character agents on the scene. Returns generated suggestions.',
  })
  runAgents(
    @CurrentUser() user: User,
    @Param('sceneId') sceneId: string,
    @Body() dto: RunAgentsDto,
  ) {
    return this.agentsService.runAgents(sceneId, user.id, dto.agentTypes);
  }

  @Post('scenes/:sceneId/shot-suggestions')
  @ApiOperation({
    summary: 'Generate shot suggestions for a scene',
    description:
      'Uses AI to suggest a shot list based on the scene content. Returns suggestions without saving.',
  })
  generateShotSuggestions(
    @CurrentUser() user: User,
    @Param('sceneId') sceneId: string,
  ) {
    return this.agentsService.generateShotSuggestions(sceneId, user.id);
  }

  @Get('scenes/:sceneId/suggestions')
  @ApiOperation({ summary: 'Get all agent suggestions for a scene' })
  getSuggestionsByScene(
    @CurrentUser() user: User,
    @Param('sceneId') sceneId: string,
  ) {
    return this.agentsService.getSuggestionsByScene(sceneId, user.id);
  }

  @Patch('agent-outputs/:id/resolve')
  @ApiOperation({ summary: 'Mark an agent suggestion as resolved' })
  resolveSuggestion(@CurrentUser() user: User, @Param('id') id: string) {
    return this.agentsService.resolveSuggestion(id, user.id);
  }
}
