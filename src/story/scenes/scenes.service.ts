import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectsService } from '../../projects/projects.service';
import { ProjectRole } from '../../generated/prisma';
import { CreateSceneDto, UpdateSceneCharactersDto } from './dto/create-scene.dto';
import { UpdateSceneDto } from './dto/update-scene.dto';

@Injectable()
export class ScenesService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
  ) {}

  private async getProjectIdFromSequence(sequenceId: string): Promise<string> {
    const sequence = await this.prisma.sequence.findUnique({
      where: { id: sequenceId },
      include: { act: true },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    return sequence.act.projectId;
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

  async create(sequenceId: string, userId: string, dto: CreateSceneDto) {
    const projectId = await this.getProjectIdFromSequence(sequenceId);

    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.scene.create({
      data: {
        ...dto,
        sequenceId,
      },
    });
  }

  async findAllBySequence(sequenceId: string, userId: string) {
    const projectId = await this.getProjectIdFromSequence(sequenceId);
    await this.projectsService.assertProjectAccess(projectId, userId);

    return this.prisma.scene.findMany({
      where: { sequenceId },
      orderBy: { index: 'asc' },
      include: {
        location: true,
        characters: {
          include: {
            character: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
        _count: { select: { shots: true } },
      },
    });
  }

  async findById(id: string, userId: string) {
    const scene = await this.prisma.scene.findUnique({
      where: { id },
      include: {
        sequence: {
          include: { act: true },
        },
        location: true,
        characters: {
          include: {
            character: true,
          },
        },
        shots: {
          orderBy: { index: 'asc' },
        },
        agentOutputs: {
          where: { resolved: false },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!scene) {
      throw new NotFoundException('Scene not found');
    }

    await this.projectsService.assertProjectAccess(
      scene.sequence.act.projectId,
      userId,
    );

    return scene;
  }

  async update(id: string, userId: string, dto: UpdateSceneDto) {
    const projectId = await this.getProjectIdFromScene(id);

    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.scene.update({
      where: { id },
      data: dto,
    });
  }

  async updateCharacters(
    id: string,
    userId: string,
    dto: UpdateSceneCharactersDto,
  ) {
    const projectId = await this.getProjectIdFromScene(id);

    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    // Replace all character associations
    await this.prisma.$transaction([
      this.prisma.sceneCharacter.deleteMany({
        where: { sceneId: id },
      }),
      this.prisma.sceneCharacter.createMany({
        data: dto.characterIds.map((characterId) => ({
          sceneId: id,
          characterId,
        })),
      }),
    ]);

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string) {
    const projectId = await this.getProjectIdFromScene(id);

    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    await this.prisma.scene.delete({
      where: { id },
    });

    return { deleted: true };
  }

  async reorder(sequenceId: string, userId: string, sceneIds: string[]) {
    const projectId = await this.getProjectIdFromSequence(sequenceId);

    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    // Two-phase update to avoid unique constraint violation on (sequenceId, index)
    await this.prisma.$transaction([
      ...sceneIds.map((id, index) =>
        this.prisma.scene.update({
          where: { id },
          data: { index: -(index + 1000) },
        }),
      ),
      ...sceneIds.map((id, index) =>
        this.prisma.scene.update({
          where: { id },
          data: { index },
        }),
      ),
    ]);

    return { success: true };
  }
}
