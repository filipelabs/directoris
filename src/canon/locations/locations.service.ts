import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectsService } from '../../projects/projects.service';
import { ProjectRole } from '../../generated/prisma';
import { CreateLocationDto, UpdateLocationDto } from './dto';

@Injectable()
export class LocationsService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
  ) {}

  async create(projectId: string, userId: string, dto: CreateLocationDto) {
    await this.projectsService.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.location.create({
      data: {
        ...dto,
        projectId,
      },
    });
  }

  async findAllByProject(projectId: string, userId: string) {
    await this.projectsService.assertProjectAccess(projectId, userId);

    return this.prisma.location.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, userId: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        scenes: {
          select: { id: true, title: true, index: true },
        },
      },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    await this.projectsService.assertProjectAccess(location.projectId, userId);

    return location;
  }

  async update(id: string, userId: string, dto: UpdateLocationDto) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    await this.projectsService.assertProjectAccess(location.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.location.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    await this.projectsService.assertProjectAccess(location.projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    await this.prisma.location.delete({
      where: { id },
    });

    return { deleted: true };
  }
}
