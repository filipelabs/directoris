import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectsService } from '../../projects/projects.service';
import { ProjectRole } from '../../generated/prisma';
import { CreateShotDto, UpdateShotDto } from './dto';

@Injectable()
export class ShotsService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
  ) {}

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

  private async getProjectIdFromShot(shotId: string): Promise<string> {
    const shot = await this.prisma.shot.findUnique({
      where: { id: shotId },
      include: { scene: { include: { sequence: { include: { act: true } } } } },
    });

    if (!shot) {
      throw new NotFoundException('Shot not found');
    }

    return shot.scene.sequence.act.projectId;
  }

  async create(sceneId: string, userId: string, dto: CreateShotDto) {
    const projectId = await this.getProjectIdFromScene(sceneId);

    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.shot.create({
      data: {
        ...dto,
        sceneId,
      },
    });
  }

  async findAllByScene(sceneId: string, userId: string) {
    const projectId = await this.getProjectIdFromScene(sceneId);
    await this.projectsService.assertProjectAccess(projectId, userId);

    return this.prisma.shot.findMany({
      where: { sceneId },
      orderBy: { index: 'asc' },
    });
  }

  async findById(id: string, userId: string) {
    const shot = await this.prisma.shot.findUnique({
      where: { id },
      include: {
        scene: {
          include: {
            sequence: { include: { act: true } },
          },
        },
        agentOutputs: {
          where: { resolved: false },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!shot) {
      throw new NotFoundException('Shot not found');
    }

    await this.projectsService.assertProjectAccess(
      shot.scene.sequence.act.projectId,
      userId,
    );

    return shot;
  }

  async update(id: string, userId: string, dto: UpdateShotDto) {
    const projectId = await this.getProjectIdFromShot(id);

    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.shot.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    const projectId = await this.getProjectIdFromShot(id);

    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    await this.prisma.shot.delete({
      where: { id },
    });

    return { deleted: true };
  }
}
