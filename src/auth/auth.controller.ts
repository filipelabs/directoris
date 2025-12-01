import {
  Controller,
  Get,
  Query,
  Res,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Get('login')
  @ApiOperation({ summary: 'Redirect to WorkOS login' })
  @ApiQuery({ name: 'screen_hint', required: false, enum: ['sign-in', 'sign-up'] })
  login(
    @Res() res: Response,
    @Query('screen_hint') screenHint?: 'sign-in' | 'sign-up',
  ) {
    const apiUrl = this.configService.get<string>('apiUrl');
    const redirectUri = `${apiUrl}/api/v1/auth/callback`;
    const authUrl = this.authService.getAuthorizationUrl(redirectUri, screenHint);
    res.redirect(authUrl);
  }

  @Public()
  @Get('callback')
  @ApiOperation({ summary: 'Handle WorkOS callback' })
  async callback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    try {
      const { user, sealedSession } = await this.authService.handleCallback(code);
      console.log('[AuthCallback] User authenticated:', JSON.stringify(user, null, 2));
      console.log('[AuthCallback] Sealed session length:', sealedSession?.length);
      const frontendUrl = this.configService.get<string>('frontendUrl');

      res.cookie('wos-session', sealedSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      console.log('[AuthCallback] Cookie set, redirecting to:', `${frontendUrl}/story`);
      res.redirect(`${frontendUrl}/story`);
    } catch (error) {
      console.error('[AuthCallback] Error:', error);
      const frontendUrl = this.configService.get<string>('frontendUrl');
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }

  @Public()
  @Get('logout')
  @ApiOperation({ summary: 'Logout and redirect to WorkOS logout' })
  async logout(@Req() req: Request, @Res() res: Response) {
    console.log('[Logout] Starting logout process');
    console.log('[Logout] Cookies:', JSON.stringify(req.cookies));

    const sessionCookie = req.cookies?.['wos-session'];
    const frontendUrl = this.configService.get<string>('frontendUrl');

    console.log('[Logout] Session cookie present:', !!sessionCookie);
    console.log('[Logout] Session cookie length:', sessionCookie?.length);

    // Clear the local cookie
    res.clearCookie('wos-session', { path: '/' });
    console.log('[Logout] Cleared local cookie');

    // Try to get WorkOS logout URL
    if (sessionCookie) {
      console.log('[Logout] Attempting to get WorkOS logout URL...');
      const logoutUrl = await this.authService.getLogoutUrl(sessionCookie);
      console.log('[Logout] WorkOS logout URL:', logoutUrl);
      if (logoutUrl) {
        // Redirect to WorkOS logout (user will be redirected to app homepage after)
        console.log('[Logout] Redirecting to WorkOS logout');
        return res.redirect(logoutUrl);
      }
    }

    // Fallback: just redirect to login page
    console.log('[Logout] Fallback: redirecting to', `${frontendUrl}/login`);
    res.redirect(`${frontendUrl}/login`);
  }

  @Get('session')
  @ApiOperation({ summary: 'Get current session info' })
  async session(@Req() req: Request) {
    // User is already attached by AuthGuard
    const user = (req as any).user;
    return { user };
  }
}
