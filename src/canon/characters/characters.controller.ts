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
import { CharactersService } from './characters.service';
import {
  CreateCharacterDto,
  UpdateCharacterDto,
  CreateCharacterArcDto,
  UpdateCharacterArcDto,
  CreateArcBeatDto,
  UpdateArcBeatDto,
  CreateCharacterFactDto,
  UpdateCharacterFactDto,
  CreateCharacterRelationshipDto,
  UpdateCharacterRelationshipDto,
} from './dto';
import { CurrentUser } from '../../common/decorators';
import type { User } from '../../generated/prisma';

@ApiTags('characters')
@ApiBearerAuth()
@Controller()
export class CharactersController {
  constructor(private charactersService: CharactersService) {}

  @Post('projects/:projectId/characters')
  @ApiOperation({ summary: 'Create a character in a project' })
  create(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Body() dto: CreateCharacterDto,
  ) {
    return this.charactersService.create(projectId, user.id, dto);
  }

  @Get('projects/:projectId/characters')
  @ApiOperation({ summary: 'List all characters in a project' })
  findAllByProject(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
  ) {
    return this.charactersService.findAllByProject(projectId, user.id);
  }

  @Get('characters/:id')
  @ApiOperation({ summary: 'Get character by ID' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.charactersService.findById(id, user.id);
  }

  @Patch('characters/:id')
  @ApiOperation({ summary: 'Update character' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCharacterDto,
  ) {
    return this.charactersService.update(id, user.id, dto);
  }

  @Delete('characters/:id')
  @ApiOperation({ summary: 'Delete character' })
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.charactersService.delete(id, user.id);
  }

  // ============ CHARACTER ARCS ============

  @Post('characters/:characterId/arcs')
  @ApiOperation({ summary: 'Create a character arc' })
  createArc(
    @CurrentUser() user: User,
    @Param('characterId') characterId: string,
    @Body() dto: CreateCharacterArcDto,
  ) {
    return this.charactersService.createArc(characterId, user.id, dto);
  }

  @Get('characters/:characterId/arcs')
  @ApiOperation({ summary: 'List all arcs for a character' })
  findArcsByCharacter(
    @CurrentUser() user: User,
    @Param('characterId') characterId: string,
  ) {
    return this.charactersService.findArcsByCharacter(characterId, user.id);
  }

  @Get('arcs/:arcId')
  @ApiOperation({ summary: 'Get character arc by ID' })
  findArcById(@CurrentUser() user: User, @Param('arcId') arcId: string) {
    return this.charactersService.findArcById(arcId, user.id);
  }

  @Patch('arcs/:arcId')
  @ApiOperation({ summary: 'Update character arc' })
  updateArc(
    @CurrentUser() user: User,
    @Param('arcId') arcId: string,
    @Body() dto: UpdateCharacterArcDto,
  ) {
    return this.charactersService.updateArc(arcId, user.id, dto);
  }

  @Delete('arcs/:arcId')
  @ApiOperation({ summary: 'Delete character arc' })
  deleteArc(@CurrentUser() user: User, @Param('arcId') arcId: string) {
    return this.charactersService.deleteArc(arcId, user.id);
  }

  // ============ ARC BEATS ============

  @Post('arcs/:arcId/beats')
  @ApiOperation({ summary: 'Create an arc beat' })
  createArcBeat(
    @CurrentUser() user: User,
    @Param('arcId') arcId: string,
    @Body() dto: CreateArcBeatDto,
  ) {
    return this.charactersService.createArcBeat(arcId, user.id, dto);
  }

  @Get('arcs/:arcId/beats')
  @ApiOperation({ summary: 'List all beats for an arc' })
  findBeatsByArc(@CurrentUser() user: User, @Param('arcId') arcId: string) {
    return this.charactersService.findBeatsByArc(arcId, user.id);
  }

  @Patch('beats/:beatId')
  @ApiOperation({ summary: 'Update arc beat' })
  updateArcBeat(
    @CurrentUser() user: User,
    @Param('beatId') beatId: string,
    @Body() dto: UpdateArcBeatDto,
  ) {
    return this.charactersService.updateArcBeat(beatId, user.id, dto);
  }

  @Delete('beats/:beatId')
  @ApiOperation({ summary: 'Delete arc beat' })
  deleteArcBeat(@CurrentUser() user: User, @Param('beatId') beatId: string) {
    return this.charactersService.deleteArcBeat(beatId, user.id);
  }

  // ============ CHARACTER FACTS ============

  @Post('characters/:characterId/facts')
  @ApiOperation({ summary: 'Create a character fact' })
  createFact(
    @CurrentUser() user: User,
    @Param('characterId') characterId: string,
    @Body() dto: CreateCharacterFactDto,
  ) {
    return this.charactersService.createFact(characterId, user.id, dto);
  }

  @Get('characters/:characterId/facts')
  @ApiOperation({ summary: 'List all facts for a character' })
  findFactsByCharacter(
    @CurrentUser() user: User,
    @Param('characterId') characterId: string,
  ) {
    return this.charactersService.findFactsByCharacter(characterId, user.id);
  }

  @Patch('facts/:factId')
  @ApiOperation({ summary: 'Update character fact' })
  updateFact(
    @CurrentUser() user: User,
    @Param('factId') factId: string,
    @Body() dto: UpdateCharacterFactDto,
  ) {
    return this.charactersService.updateFact(factId, user.id, dto);
  }

  @Delete('facts/:factId')
  @ApiOperation({ summary: 'Delete character fact' })
  deleteFact(@CurrentUser() user: User, @Param('factId') factId: string) {
    return this.charactersService.deleteFact(factId, user.id);
  }

  // ============ CHARACTER RELATIONSHIPS ============

  @Post('characters/:characterId/relationships')
  @ApiOperation({ summary: 'Create a character relationship' })
  createRelationship(
    @CurrentUser() user: User,
    @Param('characterId') characterId: string,
    @Body() dto: CreateCharacterRelationshipDto,
  ) {
    return this.charactersService.createRelationship(characterId, user.id, dto);
  }

  @Get('characters/:characterId/relationships')
  @ApiOperation({ summary: 'List all relationships for a character (outgoing and incoming)' })
  findRelationshipsByCharacter(
    @CurrentUser() user: User,
    @Param('characterId') characterId: string,
  ) {
    return this.charactersService.findRelationshipsByCharacter(characterId, user.id);
  }

  @Patch('relationships/:relationshipId')
  @ApiOperation({ summary: 'Update character relationship' })
  updateRelationship(
    @CurrentUser() user: User,
    @Param('relationshipId') relationshipId: string,
    @Body() dto: UpdateCharacterRelationshipDto,
  ) {
    return this.charactersService.updateRelationship(relationshipId, user.id, dto);
  }

  @Delete('relationships/:relationshipId')
  @ApiOperation({ summary: 'Delete character relationship' })
  deleteRelationship(
    @CurrentUser() user: User,
    @Param('relationshipId') relationshipId: string,
  ) {
    return this.charactersService.deleteRelationship(relationshipId, user.id);
  }
}
