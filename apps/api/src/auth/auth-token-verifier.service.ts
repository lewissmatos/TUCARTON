import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { AuthenticatedIdentity } from './auth.types.js';

@Injectable()
export class AuthTokenVerifier {
  constructor(private readonly config: ConfigService) {}

  async verify(authorization?: string): Promise<AuthenticatedIdentity> {
    const token = authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw this.invalidToken();

    const issuer = this.config.get<string>('AUTH0_ISSUER_URL', 'https://local.tucarton.test/');
    const audience = this.config.get<string>('AUTH0_AUDIENCE', 'https://api.tucarton.local');
    const localSecret = this.config.get<string>('AUTH_LOCAL_TEST_SECRET');

    try {
      const key = localSecret
        ? new TextEncoder().encode(localSecret)
        : createRemoteJWKSet(new URL('.well-known/jwks.json', issuer));
      const { payload } = await jwtVerify(token, key, { issuer, audience });
      if (!payload.sub) throw this.invalidToken();
      const authorizedParty = this.config.get<string>(
        'AUTH0_AUTHORIZED_PARTY',
        'wA3kOsMS3icJaCxn1ajjWXVjKzAIuIUM',
      );
      if (authorizedParty && payload.azp !== authorizedParty) throw this.invalidToken();
      return {
        subject: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : undefined,
      };
    } catch {
      throw this.invalidToken();
    }
  }

  private invalidToken(): UnauthorizedException {
    return new UnauthorizedException({
      code: 'AUTH_TOKEN_INVALID',
      message: 'A valid bearer token is required.',
    });
  }
}
