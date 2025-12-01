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
    this.clientId = this.configService.get<string>('workos.clientId')!;
    this.workos = new WorkOS(this.configService.get<string>('workos.apiKey'), {
      clientId: this.clientId,
    });
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

  async getLogoutUrl(sessionData: string): Promise<string | null> {
    try {
      console.log('[AuthService.getLogoutUrl] Attempting to authenticate session');
      const result =
        await this.workos.userManagement.authenticateWithSessionCookie({
          sessionData,
          cookiePassword: this.cookiePassword,
        });

      console.log('[AuthService.getLogoutUrl] Auth result:', JSON.stringify(result, null, 2));

      if (!result.authenticated) {
        console.log('[AuthService.getLogoutUrl] Session not authenticated');
        return null;
      }

      // Get session ID from the access token
      const accessToken = result.accessToken;
      // Decode JWT to get session ID (sid claim)
      const payload = JSON.parse(
        Buffer.from(accessToken.split('.')[1], 'base64').toString(),
      );
      const sessionId = payload.sid;
      console.log('[AuthService.getLogoutUrl] Session ID from JWT:', sessionId);

      const logoutUrl = this.workos.userManagement.getLogoutUrl({ sessionId });
      console.log('[AuthService.getLogoutUrl] Generated logout URL:', logoutUrl);
      return logoutUrl;
    } catch (error) {
      console.error('[AuthService.getLogoutUrl] Error:', error);
      return null;
    }
  }
}
