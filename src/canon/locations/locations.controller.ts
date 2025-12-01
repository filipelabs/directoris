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
import { LocationsService } from './locations.service';
import { CreateLocationDto, UpdateLocationDto } from './dto';
import { CurrentUser } from '../../common/decorators';
import type { User } from '../../generated/prisma';

@ApiTags('locations')
@ApiBearerAuth()
@Controller()
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Post('projects/:projectId/locations')
  @ApiOperation({ summary: 'Create a location in a project' })
  create(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Body() dto: CreateLocationDto,
  ) {
    return this.locationsService.create(projectId, user.id, dto);
  }

  @Get('projects/:projectId/locations')
  @ApiOperation({ summary: 'List all locations in a project' })
  findAllByProject(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
  ) {
    return this.locationsService.findAllByProject(projectId, user.id);
  }

  @Get('locations/:id')
  @ApiOperation({ summary: 'Get location by ID' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.locationsService.findById(id, user.id);
  }

  @Patch('locations/:id')
  @ApiOperation({ summary: 'Update location' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationsService.update(id, user.id, dto);
  }

  @Delete('locations/:id')
  @ApiOperation({ summary: 'Delete location' })
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.locationsService.delete(id, user.id);
  }
}
