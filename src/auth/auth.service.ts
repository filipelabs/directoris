import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkOS } from '@workos-inc/node';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private workos: WorkOS;
  private clientId: string;
  private cookiePassword: string;
  private frontendUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.workos = new WorkOS(this.configService.get<string>('workos.apiKey'));
    this.clientId = this.configService.get<string>('workos.clientId')!;
    this.cookiePassword = this.configService.get<string>(
      'workos.cookiePassword',
    )!;
    this.frontendUrl = this.configService.get<string>('frontendUrl')!;
  }

  getAuthorizationUrl(redirectUri: string, screenHint?: 'sign-in' | 'sign-up') {
    return this.workos.userManagement.getAuthorizationUrl({
      clientId: this.clientId,
      redirectUri,
      provider: 'authkit',
      screenHint,
    });
  }

  async handleCallback(code: string) {
    const authResponse = await this.workos.userManagement.authenticateWithCode({
      code,
      clientId: this.clientId,
      session: {
        sealSession: true,
        cookiePassword: this.cookiePassword,
      },
    });

    // Upsert user in our database
    const user = await this.prisma.user.upsert({
      where: { workosId: authResponse.user.id },
      update: {
        email: authResponse.user.email,
        name:
          authResponse.user.firstName && authResponse.user.lastName
            ? `${authResponse.user.firstName} ${authResponse.user.lastName}`
            : authResponse.user.firstName || null,
        avatarUrl: authResponse.user.profilePictureUrl || null,
      },
      create: {
        workosId: authResponse.user.id,
        email: authResponse.user.email,
        name:
          authResponse.user.firstName && authResponse.user.lastName
            ? `${authResponse.user.firstName} ${authResponse.user.lastName}`
            : authResponse.user.firstName || null,
        avatarUrl: authResponse.user.profilePictureUrl || null,
      },
    });

    return {
      user,
      sealedSession: authResponse.sealedSession,
    };
  }

  async refreshSession(sessionData: string) {
    try {
      const result =
        await this.workos.userManagement.authenticateWithSessionCookie({
          sessionData,
          cookiePassword: this.cookiePassword,
        });

      if (!result.authenticated) {
        return null;
      }

      return result;
    } catch {
      return null;
    }
  }
}
