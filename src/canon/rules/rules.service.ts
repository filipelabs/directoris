import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectsService } from '../../projects/projects.service';
import { ProjectRole } from '../../generated/prisma';
import { CreateRuleDto, UpdateRuleDto } from './dto';

@Injectable()
export class RulesService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
  ) {}

  async create(projectId: string, userId: string, dto: CreateRuleDto) {
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.worldRule.create({
      data: {
        ...dto,
        projectId,
      },
    });
  }

  async findAllByProject(projectId: string, userId: string) {
    await this.projectsService.assertProjectAccess(projectId, userId);

    return this.prisma.worldRule.findMany({
      where: { projectId },
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    });
  }

  async findById(id: string, userId: string) {
    const rule = await this.prisma.worldRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException('World rule not found');
    }

    await this.projectsService.assertProjectAccess(rule.projectId, userId);

    return rule;
  }

  async update(id: string, userId: string, dto: UpdateRuleDto) {
    const rule = await this.prisma.worldRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException('World rule not found');
    }

    await this.projectsService.assertProjectAccess(rule.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.worldRule.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    const rule = await this.prisma.worldRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException('World rule not found');
    }

    await this.projectsService.assertProjectAccess(rule.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    await this.prisma.worldRule.delete({
      where: { id },
    });

    return { deleted: true };
  }
}
