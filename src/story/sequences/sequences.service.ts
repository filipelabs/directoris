import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectsService } from '../../projects/projects.service';
import { ProjectRole } from '../../generated/prisma';
import { CreateSequenceDto, UpdateSequenceDto } from './dto';

@Injectable()
export class SequencesService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
  ) {}

  async create(actId: string, userId: string, dto: CreateSequenceDto) {
    const act = await this.prisma.act.findUnique({
      where: { id: actId },
    });

    if (!act) {
      throw new NotFoundException('Act not found');
    }

    await this.projectsService.assertProjectAccess(act.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.sequence.create({
      data: {
        ...dto,
        actId,
      },
    });
  }

  async findAllByAct(actId: string, userId: string) {
    const act = await this.prisma.act.findUnique({
      where: { id: actId },
    });

    if (!act) {
      throw new NotFoundException('Act not found');
    }

    await this.projectsService.assertProjectAccess(act.projectId, userId);

    return this.prisma.sequence.findMany({
      where: { actId },
      orderBy: { index: 'asc' },
      include: {
        scenes: {
          orderBy: { index: 'asc' },
          select: { id: true, title: true, index: true },
        },
      },
    });
  }

  async findById(id: string, userId: string) {
    const sequence = await this.prisma.sequence.findUnique({
      where: { id },
      include: {
        act: true,
        scenes: {
          orderBy: { index: 'asc' },
        },
      },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    await this.projectsService.assertProjectAccess(
      sequence.act.projectId,
      userId,
    );

    return sequence;
  }

  async update(id: string, userId: string, dto: UpdateSequenceDto) {
    const sequence = await this.prisma.sequence.findUnique({
      where: { id },
      include: { act: true },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    await this.projectsService.assertProjectAccess(
      sequence.act.projectId,
      userId,
      [ProjectRole.OWNER, ProjectRole.EDITOR],
    );

    return this.prisma.sequence.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    const sequence = await this.prisma.sequence.findUnique({
      where: { id },
      include: { act: true },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    await this.projectsService.assertProjectAccess(
      sequence.act.projectId,
      userId,
      [ProjectRole.OWNER, ProjectRole.EDITOR],
    );

    await this.prisma.sequence.delete({
      where: { id },
    });

    return { deleted: true };
  }
}
