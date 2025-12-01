import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectsService } from '../../projects/projects.service';
import { ProjectRole } from '../../generated/prisma';
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

@Injectable()
export class CharactersService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
  ) {}

  async create(projectId: string, userId: string, dto: CreateCharacterDto) {
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.character.create({
      data: {
        ...dto,
        projectId,
      },
    });
  }

  async findAllByProject(projectId: string, userId: string) {
    await this.projectsService.assertProjectAccess(projectId, userId);

    return this.prisma.character.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, userId: string) {
    const character = await this.prisma.character.findUnique({
      where: { id },
      include: {
        scenes: {
          include: {
            scene: {
              select: { id: true, title: true, index: true },
            },
          },
        },
      },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    await this.projectsService.assertProjectAccess(character.projectId, userId);

    return character;
  }

  async update(id: string, userId: string, dto: UpdateCharacterDto) {
    const character = await this.prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    await this.projectsService.assertProjectAccess(character.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.character.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    const character = await this.prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    await this.projectsService.assertProjectAccess(character.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    await this.prisma.character.delete({
      where: { id },
    });

    return { deleted: true };
  }

  // ============ HELPER METHODS ============

  private async getProjectIdFromCharacter(characterId: string): Promise<string> {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });
    if (!character) {
      throw new NotFoundException('Character not found');
    }
    return character.projectId;
  }

  private async getProjectIdFromArc(arcId: string): Promise<string> {
    const arc = await this.prisma.characterArc.findUnique({
      where: { id: arcId },
      include: { character: true },
    });
    if (!arc) {
      throw new NotFoundException('Character arc not found');
    }
    return arc.character.projectId;
  }

  private async getProjectIdFromBeat(beatId: string): Promise<string> {
    const beat = await this.prisma.characterArcBeat.findUnique({
      where: { id: beatId },
      include: { arc: { include: { character: true } } },
    });
    if (!beat) {
      throw new NotFoundException('Arc beat not found');
    }
    return beat.arc.character.projectId;
  }

  private async getProjectIdFromFact(factId: string): Promise<string> {
    const fact = await this.prisma.characterFact.findUnique({
      where: { id: factId },
      include: { character: true },
    });
    if (!fact) {
      throw new NotFoundException('Character fact not found');
    }
    return fact.character.projectId;
  }

  private async getProjectIdFromRelationship(relationshipId: string): Promise<string> {
    const relationship = await this.prisma.characterRelationship.findUnique({
      where: { id: relationshipId },
      include: { from: true },
    });
    if (!relationship) {
      throw new NotFoundException('Character relationship not found');
    }
    return relationship.from.projectId;
  }

  // ============ CHARACTER ARCS ============

  async createArc(characterId: string, userId: string, dto: CreateCharacterArcDto) {
    const projectId = await this.getProjectIdFromCharacter(characterId);
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.characterArc.create({
      data: {
        ...dto,
        characterId,
      },
    });
  }

  async findArcsByCharacter(characterId: string, userId: string) {
    const projectId = await this.getProjectIdFromCharacter(characterId);
    await this.projectsService.assertProjectAccess(projectId, userId);

    return this.prisma.characterArc.findMany({
      where: { characterId },
      include: {
        beats: {
          orderBy: { index: 'asc' },
        },
      },
      orderBy: { season: 'asc' },
    });
  }

  async findArcById(arcId: string, userId: string) {
    const projectId = await this.getProjectIdFromArc(arcId);
    await this.projectsService.assertProjectAccess(projectId, userId);

    return this.prisma.characterArc.findUnique({
      where: { id: arcId },
      include: {
        character: {
          select: { id: true, name: true },
        },
        beats: {
          include: {
            scene: {
              select: { id: true, title: true, index: true },
            },
          },
          orderBy: { index: 'asc' },
        },
      },
    });
  }

  async updateArc(arcId: string, userId: string, dto: UpdateCharacterArcDto) {
    const projectId = await this.getProjectIdFromArc(arcId);
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.characterArc.update({
      where: { id: arcId },
      data: dto,
    });
  }

  async deleteArc(arcId: string, userId: string) {
    const projectId = await this.getProjectIdFromArc(arcId);
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    await this.prisma.characterArc.delete({
      where: { id: arcId },
    });

    return { deleted: true };
  }

  // ============ ARC BEATS ============

  async createArcBeat(arcId: string, userId: string, dto: CreateArcBeatDto) {
    const projectId = await this.getProjectIdFromArc(arcId);
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.characterArcBeat.create({
      data: {
        ...dto,
        arcId,
      },
    });
  }

  async findBeatsByArc(arcId: string, userId: string) {
    const projectId = await this.getProjectIdFromArc(arcId);
    await this.projectsService.assertProjectAccess(projectId, userId);

    return this.prisma.characterArcBeat.findMany({
      where: { arcId },
      include: {
        scene: {
          select: { id: true, title: true, index: true },
        },
      },
      orderBy: { index: 'asc' },
    });
  }

  async updateArcBeat(beatId: string, userId: string, dto: UpdateArcBeatDto) {
    const projectId = await this.getProjectIdFromBeat(beatId);
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.characterArcBeat.update({
      where: { id: beatId },
      data: dto,
    });
  }

  async deleteArcBeat(beatId: string, userId: string) {
    const projectId = await this.getProjectIdFromBeat(beatId);
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    await this.prisma.characterArcBeat.delete({
      where: { id: beatId },
    });

    return { deleted: true };
  }

  // ============ CHARACTER FACTS ============

  async createFact(characterId: string, userId: string, dto: CreateCharacterFactDto) {
    const projectId = await this.getProjectIdFromCharacter(characterId);
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.characterFact.create({
      data: {
        ...dto,
        characterId,
      },
    });
  }

  async findFactsByCharacter(characterId: string, userId: string) {
    const projectId = await this.getProjectIdFromCharacter(characterId);
    await this.projectsService.assertProjectAccess(projectId, userId);

    return this.prisma.characterFact.findMany({
      where: { characterId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateFact(factId: string, userId: string, dto: UpdateCharacterFactDto) {
    const projectId = await this.getProjectIdFromFact(factId);
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.characterFact.update({
      where: { id: factId },
      data: dto,
    });
  }

  async deleteFact(factId: string, userId: string) {
    const projectId = await this.getProjectIdFromFact(factId);
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    await this.prisma.characterFact.delete({
      where: { id: factId },
    });

    return { deleted: true };
  }

  // ============ CHARACTER RELATIONSHIPS ============

  async createRelationship(
    characterId: string,
    userId: string,
    dto: CreateCharacterRelationshipDto,
  ) {
    const projectId = await this.getProjectIdFromCharacter(characterId);
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    // Verify target character exists and is in the same project
    const targetCharacter = await this.prisma.character.findUnique({
      where: { id: dto.toId },
    });
    if (!targetCharacter || targetCharacter.projectId !== projectId) {
      throw new NotFoundException('Target character not found in this project');
    }

    return this.prisma.characterRelationship.create({
      data: {
        fromId: characterId,
        toId: dto.toId,
        label: dto.label,
        description: dto.description,
        dynamic: dto.dynamic,
      },
      include: {
        to: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findRelationshipsByCharacter(characterId: string, userId: string) {
    const projectId = await this.getProjectIdFromCharacter(characterId);
    await this.projectsService.assertProjectAccess(projectId, userId);

    // Get relationships where this character is either from or to
    const [outgoing, incoming] = await Promise.all([
      this.prisma.characterRelationship.findMany({
        where: { fromId: characterId },
        include: {
          to: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.characterRelationship.findMany({
        where: { toId: characterId },
        include: {
          from: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return { outgoing, incoming };
  }

  async updateRelationship(
    relationshipId: string,
    userId: string,
    dto: UpdateCharacterRelationshipDto,
  ) {
    const projectId = await this.getProjectIdFromRelationship(relationshipId);
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.characterRelationship.update({
      where: { id: relationshipId },
      data: dto,
      include: {
        from: {
          select: { id: true, name: true },
        },
        to: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async deleteRelationship(relationshipId: string, userId: string) {
    const projectId = await this.getProjectIdFromRelationship(relationshipId);
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    await this.prisma.characterRelationship.delete({
      where: { id: relationshipId },
    });

    return { deleted: true };
  }
}
