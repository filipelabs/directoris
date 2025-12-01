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
    const port = this.configService.get<number>('port');
    const redirectUri = `http://localhost:${port}/api/v1/auth/callback`;
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

  @Post('logout')
  @ApiOperation({ summary: 'Logout and clear session' })
  logout(@Res() res: Response) {
    res.clearCookie('wos-session');
    res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }

  @Get('session')
  @ApiOperation({ summary: 'Get current session info' })
  async session(@Req() req: Request) {
    // User is already attached by AuthGuard
    const user = (req as any).user;
    return { user };
  }
}
