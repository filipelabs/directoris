import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service for internal API endpoints.
 * Provides data to AgentOS without user authentication.
 */
@Injectable()
export class InternalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get scene with full context (sequence, act, project, characters, location)
   */
  async getScene(sceneId: string) {
    const scene = await this.prisma.scene.findUnique({
      where: { id: sceneId },
      include: {
        sequence: {
          include: {
            act: {
              include: {
                project: true,
              },
            },
          },
        },
        location: true,
        characters: {
          include: {
            character: {
              include: {
                arcs: true,
                facts: true,
                relationshipsFrom: true,
                relationshipsTo: true,
              },
            },
          },
        },
        shots: {
          orderBy: { index: 'asc' },
        },
      },
    });

    if (!scene) {
      throw new NotFoundException('Scene not found');
    }

    return scene;
  }

  /**
   * Get all canon data for a project (characters, locations, world rules)
   */
  async getProjectCanon(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const [characters, locations, worldRules] = await Promise.all([
      this.prisma.character.findMany({
        where: { projectId },
        include: {
          arcs: {
            include: {
              beats: {
                orderBy: { index: 'asc' },
              },
            },
          },
          facts: true,
          relationshipsFrom: {
            include: { to: true },
          },
          relationshipsTo: {
            include: { from: true },
          },
        },
      }),
      this.prisma.location.findMany({
        where: { projectId },
      }),
      this.prisma.worldRule.findMany({
        where: { projectId },
      }),
    ]);

    return { characters, locations, worldRules };
  }

  /**
   * Get character with full details (arcs, facts, relationships)
   */
  async getCharacter(characterId: string) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: {
        arcs: {
          include: {
            beats: {
              orderBy: { index: 'asc' },
              include: {
                scene: {
                  select: {
                    id: true,
                    title: true,
                    index: true,
                  },
                },
              },
            },
          },
        },
        facts: true,
        relationshipsFrom: {
          include: { to: true },
        },
        relationshipsTo: {
          include: { from: true },
        },
      },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return character;
  }

  /**
   * Get character arcs with beats
   */
  async getCharacterArcs(characterId: string) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return this.prisma.characterArc.findMany({
      where: { characterId },
      include: {
        beats: {
          orderBy: { index: 'asc' },
          include: {
            scene: {
              select: {
                id: true,
                title: true,
                index: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get all scenes in a project (for continuity checks)
   */
  async getProjectScenes(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.scene.findMany({
      where: {
        sequence: {
          act: {
            projectId,
          },
        },
      },
      include: {
        sequence: {
          include: {
            act: true,
          },
        },
        location: true,
        characters: {
          include: {
            character: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { sequence: { act: { index: 'asc' } } },
        { sequence: { index: 'asc' } },
        { index: 'asc' },
      ],
    });
  }
}
