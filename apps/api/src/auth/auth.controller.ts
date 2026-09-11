import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService, type LocalUser } from './auth.service.js';
import { LocalSessionService, type LocalSessionCredentials } from './local-session.service.js';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly localSessions: LocalSessionService,
  ) {}

  @Post('register')
  async register(
    @Body() body: { displayName: string; phone: string; passcode: string },
  ): Promise<LocalSessionCredentials & { user: LocalUser }> {
    const user = await this.authService.register(body);
    return { ...(await this.localSessions.create(user.id)), user };
  }

  @Post('login')
  async login(
    @Body() body: { phone: string; passcode: string },
  ): Promise<LocalSessionCredentials & { user: LocalUser }> {
    const user = await this.authService.login(body.phone, body.passcode);
    return { ...(await this.localSessions.create(user.id)), user };
  }

  @Get('session/me')
  async me(@Headers('authorization') authorization?: string): Promise<LocalUser> {
    return this.authService.findById(await this.localSessions.verifyAccess(authorization));
  }

  @Post('session/logout')
  async logout(@Body('refreshToken') refreshToken: string): Promise<{ ok: true }> {
    await this.localSessions.revoke(refreshToken);
    return { ok: true };
  }
}
