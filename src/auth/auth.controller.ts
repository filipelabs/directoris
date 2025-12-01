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
      const frontendUrl = this.configService.get<string>('frontendUrl');

      res.cookie('wos-session', sealedSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

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
    const sessionCookie = req.cookies?.['wos-session'];
    const frontendUrl = this.configService.get<string>('frontendUrl');

    // Clear the local cookie
    res.clearCookie('wos-session', { path: '/' });

    // Try to get WorkOS logout URL
    if (sessionCookie) {
      const logoutUrl = await this.authService.getLogoutUrl(sessionCookie);
      if (logoutUrl) {
        return res.redirect(logoutUrl);
      }
    }

    // Fallback: just redirect to login page
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
