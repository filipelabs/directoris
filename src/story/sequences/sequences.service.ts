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

    // Auto-calculate next index if not provided or if conflict exists
    let index = dto.index;
    const maxSequence = await this.prisma.sequence.findFirst({
      where: { actId },
      orderBy: { index: 'desc' },
      select: { index: true },
    });
    const nextIndex = (maxSequence?.index ?? -1) + 1;

    // Use next available index if provided index would conflict
    if (index <= (maxSequence?.index ?? -1)) {
      index = nextIndex;
    }

    return this.prisma.sequence.create({
      data: {
        ...dto,
        index,
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

  async reorder(actId: string, userId: string, sequenceIds: string[]) {
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

    // Two-phase update to avoid unique constraint violation on (actId, index)
    await this.prisma.$transaction([
      ...sequenceIds.map((id, index) =>
        this.prisma.sequence.update({
          where: { id },
          data: { index: -(index + 1000) },
        }),
      ),
      ...sequenceIds.map((id, index) =>
        this.prisma.sequence.update({
          where: { id },
          data: { index },
        }),
      ),
    ]);

    return { success: true };
  }
}
