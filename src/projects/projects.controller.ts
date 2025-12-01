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
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddMemberDto,
  UpdateMemberRoleDto,
} from './dto';
import { CurrentUser } from '../common/decorators';
import type { User } from '../generated/prisma';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(@CurrentUser() user: User, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all projects for current user' })
  findAll(@CurrentUser() user: User) {
    return this.projectsService.findAllForUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.projectsService.findById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.projectsService.delete(id, user.id);
  }

  // Member management
  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to project' })
  addMember(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.projectsService.addMember(id, user.id, dto);
  }

  @Patch(':id/members/:memberId')
  @ApiOperation({ summary: 'Update member role' })
  updateMemberRole(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.projectsService.updateMemberRole(id, user.id, memberId, dto.role);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove member from project' })
  removeMember(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.projectsService.removeMember(id, user.id, memberId);
  }
}
