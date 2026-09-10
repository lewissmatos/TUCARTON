import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService, type LocalUser } from './auth.service.js';
import { AuthTokenVerifier } from './auth-token-verifier.service.js';
import { LocalSessionService, type LocalSessionCredentials } from './local-session.service.js';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenVerifier: AuthTokenVerifier,
    private readonly localSessions: LocalSessionService,
  ) {}

  @Post('bootstrap')
  async bootstrap(@Headers('authorization') authorization?: string): Promise<LocalUser> {
    return this.authService.bootstrap(await this.tokenVerifier.verify(authorization));
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string): Promise<LocalUser> {
    return this.authService.bootstrap(await this.tokenVerifier.verify(authorization));
  }

  @Post('phone-verification/start')
  async startPhoneVerification(
    @Headers('authorization') authorization: string | undefined,
    @Body('phoneE164') phoneE164: string,
  ): Promise<{ verificationId: string; developmentCode?: string }> {
    const user = await this.authService.bootstrap(await this.tokenVerifier.verify(authorization));
    const result = await this.authService.startPhoneVerification(user, phoneE164);
    return process.env.NODE_ENV === 'production'
      ? result
      : { ...result, developmentCode: '000000' };
  }

  @Post('phone-verification/verify')
  async verifyPhone(
    @Headers('authorization') authorization: string | undefined,
    @Body('verificationId') verificationId: string,
    @Body('code') code: string,
  ): Promise<LocalUser> {
    const user = await this.authService.bootstrap(await this.tokenVerifier.verify(authorization));
    return this.authService.verifyPhone(user, verificationId, code);
  }

  @Post('phone-access/start')
  async startPhoneAccess(
    @Body('phone') phone: string,
  ): Promise<{ verificationId: string; phoneE164: string; developmentCode?: string }> {
    const result = await this.authService.startPhoneAccess(phone);
    return process.env.NODE_ENV === 'production'
      ? result
      : { ...result, developmentCode: '000000' };
  }

  @Post('phone-access/verify')
  async verifyPhoneAccess(
    @Body('phone') phone: string,
    @Body('verificationId') verificationId: string,
    @Body('code') code: string,
  ): Promise<LocalSessionCredentials & { user: LocalUser }> {
    const user = await this.authService.verifyPhoneAccess(phone, verificationId, code);
    return { ...(await this.localSessions.create(user.id)), user };
  }

  @Get('phone-access/me')
  async localMe(@Headers('authorization') authorization?: string): Promise<LocalUser> {
    return this.authService.findById(await this.localSessions.verifyAccess(authorization));
  }

  @Post('phone-access/logout')
  async localLogout(@Body('refreshToken') refreshToken: string): Promise<{ ok: true }> {
    await this.localSessions.revoke(refreshToken);
    return { ok: true };
  }
}
