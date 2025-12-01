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
import { ActsService } from './acts.service';
import { CreateActDto, UpdateActDto } from './dto';
import { CurrentUser } from '../../common/decorators';
import type { User } from '../../generated/prisma';

@ApiTags('acts')
@ApiBearerAuth()
@Controller()
export class ActsController {
  constructor(private actsService: ActsService) {}

  @Post('projects/:projectId/acts')
  @ApiOperation({ summary: 'Create an act in a project' })
  create(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Body() dto: CreateActDto,
  ) {
    return this.actsService.create(projectId, user.id, dto);
  }

  @Get('projects/:projectId/acts')
  @ApiOperation({ summary: 'List all acts in a project with nested structure' })
  findAllByProject(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
  ) {
    return this.actsService.findAllByProject(projectId, user.id);
  }

  @Get('acts/:id')
  @ApiOperation({ summary: 'Get act by ID' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.actsService.findById(id, user.id);
  }

  @Patch('acts/:id')
  @ApiOperation({ summary: 'Update act' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateActDto,
  ) {
    return this.actsService.update(id, user.id, dto);
  }

  @Delete('acts/:id')
  @ApiOperation({ summary: 'Delete act' })
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.actsService.delete(id, user.id);
  }
}
