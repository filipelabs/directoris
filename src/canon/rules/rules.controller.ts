import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RulesService } from './rules.service';
import { CreateRuleDto, UpdateRuleDto } from './dto';
import { CurrentUser } from '../../common/decorators';
import type { User } from '../../generated/prisma';

@ApiTags('world-rules')
@ApiBearerAuth()
@Controller()
export class RulesController {
  constructor(private rulesService: RulesService) {}

  @Post('projects/:projectId/rules')
  @ApiOperation({ summary: 'Create a world rule in a project' })
  create(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Body() dto: CreateRuleDto,
  ) {
    return this.rulesService.create(projectId, user.id, dto);
  }

  @Get('projects/:projectId/rules')
  @ApiOperation({ summary: 'List all world rules in a project' })
  findAllByProject(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
  ) {
    return this.rulesService.findAllByProject(projectId, user.id);
  }

  @Get('rules/:id')
  @ApiOperation({ summary: 'Get world rule by ID' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.rulesService.findById(id, user.id);
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Update world rule' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateRuleDto,
  ) {
    return this.rulesService.update(id, user.id, dto);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Delete world rule' })
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.rulesService.delete(id, user.id);
  }
}
