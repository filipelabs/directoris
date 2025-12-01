import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectRole } from '../generated/prisma';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Assert that a user has access to a project with optional role check.
   * This is the critical multi-tenancy enforcement method.
   */
  async assertProjectAccess(
    projectId: string,
    userId: string,
    roles?: ProjectRole[],
  ) {
    const membership = await this.prisma.projectMembership.findFirst({
      where: { projectId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('No access to this project');
    }

    if (roles && !roles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return membership;
  }

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          ...dto,
          ownerId: userId,
        },
      });

      // Auto-create OWNER membership for creator
      await tx.projectMembership.create({
        data: {
          projectId: project.id,
          userId,
          role: ProjectRole.OWNER,
        },
      });

      return project;
    });
  }

  async findAllForUser(userId: string) {
    const memberships = await this.prisma.projectMembership.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            owner: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
            _count: {
              select: { memberships: true, acts: true, characters: true },
            },
          },
        },
      },
      orderBy: { project: { updatedAt: 'desc' } },
    });

    return memberships.map((m) => ({
      ...m.project,
      role: m.role,
    }));
  }

  async findById(projectId: string, userId: string) {
    await this.assertProjectAccess(projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        memberships: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: {
            acts: true,
            characters: true,
            locations: true,
            rules: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(projectId: string, userId: string, dto: UpdateProjectDto) {
    await this.assertProjectAccess(projectId, userId, [
      ProjectRole.OWNER,
      ProjectRole.EDITOR,
    ]);

    return this.prisma.project.update({
      where: { id: projectId },
      data: dto,
    });
  }

  async delete(projectId: string, userId: string) {
    await this.assertProjectAccess(projectId, userId, [ProjectRole.OWNER]);

    await this.prisma.project.delete({
      where: { id: projectId },
    });

    return { deleted: true };
  }

  async addMember(projectId: string, userId: string, dto: AddMemberDto) {
    await this.assertProjectAccess(projectId, userId, [ProjectRole.OWNER]);

    // Find user by email
    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!targetUser) {
      throw new NotFoundException('User with this email not found');
    }

    // Check if already a member
    const existing = await this.prisma.projectMembership.findUnique({
      where: {
        userId_projectId: {
          userId: targetUser.id,
          projectId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this project');
    }

    return this.prisma.projectMembership.create({
      data: {
        projectId,
        userId: targetUser.id,
        role: dto.role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async updateMemberRole(
    projectId: string,
    userId: string,
    memberId: string,
    role: ProjectRole,
  ) {
    await this.assertProjectAccess(projectId, userId, [ProjectRole.OWNER]);

    // Can't change owner's role
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (project?.ownerId === memberId && role !== ProjectRole.OWNER) {
      throw new ForbiddenException("Cannot change project owner's role");
    }

    return this.prisma.projectMembership.update({
      where: {
        userId_projectId: {
          userId: memberId,
          projectId,
        },
      },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async removeMember(projectId: string, userId: string, memberId: string) {
    await this.assertProjectAccess(projectId, userId, [ProjectRole.OWNER]);

    // Can't remove the owner
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (project?.ownerId === memberId) {
      throw new ForbiddenException('Cannot remove project owner');
    }

    await this.prisma.projectMembership.delete({
      where: {
        userId_projectId: {
          userId: memberId,
          projectId,
        },
      },
    });

    return { removed: true };
  }
}
