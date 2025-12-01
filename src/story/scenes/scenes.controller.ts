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
import { ScenesService } from './scenes.service';
import { CreateSceneDto, UpdateSceneCharactersDto } from './dto/create-scene.dto';
import { UpdateSceneDto } from './dto/update-scene.dto';
import { CurrentUser } from '../../common/decorators';
import type { User } from '../../generated/prisma';

@ApiTags('scenes')
@ApiBearerAuth()
@Controller()
export class ScenesController {
  constructor(private scenesService: ScenesService) {}

  @Post('sequences/:sequenceId/scenes')
  @ApiOperation({ summary: 'Create a scene in a sequence' })
  create(
    @CurrentUser() user: User,
    @Param('sequenceId') sequenceId: string,
    @Body() dto: CreateSceneDto,
  ) {
    return this.scenesService.create(sequenceId, user.id, dto);
  }

  @Get('sequences/:sequenceId/scenes')
  @ApiOperation({ summary: 'List all scenes in a sequence' })
  findAllBySequence(
    @CurrentUser() user: User,
    @Param('sequenceId') sequenceId: string,
  ) {
    return this.scenesService.findAllBySequence(sequenceId, user.id);
  }

  @Get('scenes/:id')
  @ApiOperation({ summary: 'Get scene by ID with all details' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.scenesService.findById(id, user.id);
  }

  @Patch('scenes/:id')
  @ApiOperation({ summary: 'Update scene' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateSceneDto,
  ) {
    return this.scenesService.update(id, user.id, dto);
  }

  @Patch('scenes/:id/characters')
  @ApiOperation({ summary: 'Update characters in scene' })
  updateCharacters(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateSceneCharactersDto,
  ) {
    return this.scenesService.updateCharacters(id, user.id, dto);
  }

  @Delete('scenes/:id')
  @ApiOperation({ summary: 'Delete scene' })
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.scenesService.delete(id, user.id);
  }
}
