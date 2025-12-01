import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { WorkOS } from '@workos-inc/node';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private workos: WorkOS;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.workos = new WorkOS(this.configService.get<string>('workos.apiKey'));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const sessionCookie = request.cookies?.wos_session;

    if (!sessionCookie) {
      throw new UnauthorizedException('No session cookie');
    }

    try {
      const cookiePassword = this.configService.get<string>(
        'workos.cookiePassword',
      );
      const sessionAuth =
        await this.workos.userManagement.authenticateWithSessionCookie({
          sessionData: sessionCookie,
          cookiePassword: cookiePassword!,
        });

      if (!sessionAuth.authenticated) {
        throw new UnauthorizedException('Invalid session');
      }

      // Get or create user in our database
      const user = await this.prisma.user.upsert({
        where: { workosId: sessionAuth.user.id },
        update: {
          email: sessionAuth.user.email,
          name:
            sessionAuth.user.firstName && sessionAuth.user.lastName
              ? `${sessionAuth.user.firstName} ${sessionAuth.user.lastName}`
              : sessionAuth.user.firstName || null,
          avatarUrl: sessionAuth.user.profilePictureUrl || null,
        },
        create: {
          workosId: sessionAuth.user.id,
          email: sessionAuth.user.email,
          name:
            sessionAuth.user.firstName && sessionAuth.user.lastName
              ? `${sessionAuth.user.firstName} ${sessionAuth.user.lastName}`
              : sessionAuth.user.firstName || null,
          avatarUrl: sessionAuth.user.profilePictureUrl || null,
        },
      });

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
