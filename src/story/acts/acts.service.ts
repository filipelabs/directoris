import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectsService } from '../../projects/projects.service';
import { ProjectRole } from '../../generated/prisma';
import { CreateActDto, UpdateActDto } from './dto';

@Injectable()
export class ActsService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
  ) {}

  async create(projectId: string, userId: string, dto: CreateActDto) {
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    // Auto-calculate next index if not provided or if conflict exists
    let index = dto.index;
    const maxAct = await this.prisma.act.findFirst({
      where: { projectId },
      orderBy: { index: 'desc' },
      select: { index: true },
    });
    const nextIndex = (maxAct?.index ?? -1) + 1;

    // Use next available index if provided index would conflict
    if (index <= (maxAct?.index ?? -1)) {
      index = nextIndex;
    }

    return this.prisma.act.create({
      data: {
        ...dto,
        index,
        projectId,
      },
    });
  }

  async findAllByProject(projectId: string, userId: string) {
    await this.projectsService.assertProjectAccess(projectId, userId);

    return this.prisma.act.findMany({
      where: { projectId },
      orderBy: { index: 'asc' },
      include: {
        sequences: {
          orderBy: { index: 'asc' },
          include: {
            scenes: {
              orderBy: { index: 'asc' },
              select: { id: true, title: true, index: true },
            },
          },
        },
      },
    });
  }

  async findById(id: string, userId: string) {
    const act = await this.prisma.act.findUnique({
      where: { id },
      include: {
        sequences: {
          orderBy: { index: 'asc' },
          include: {
            scenes: {
              orderBy: { index: 'asc' },
            },
          },
        },
      },
    });

    if (!act) {
      throw new NotFoundException('Act not found');
    }

    await this.projectsService.assertProjectAccess(act.projectId, userId);

    return act;
  }

  async update(id: string, userId: string, dto: UpdateActDto) {
    const act = await this.prisma.act.findUnique({
      where: { id },
    });

    if (!act) {
      throw new NotFoundException('Act not found');
    }

    await this.projectsService.assertProjectAccess(act.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.act.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    const act = await this.prisma.act.findUnique({
      where: { id },
    });

    if (!act) {
      throw new NotFoundException('Act not found');
    }

    await this.projectsService.assertProjectAccess(act.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    await this.prisma.act.delete({
      where: { id },
    });

    return { deleted: true };
  }
}
