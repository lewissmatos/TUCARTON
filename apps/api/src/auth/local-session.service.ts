import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { SignJWT, jwtVerify } from 'jose';
import { DatabaseService } from '../db/database.service.js';
import { localSessions } from '../db/schema.js';

export interface LocalSessionCredentials {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class LocalSessionService {
  constructor(
    private readonly database: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  async create(userId: string): Promise<LocalSessionCredentials> {
    const refreshToken = randomBytes(32).toString('base64url');
    const sessionId = randomUUID();
    await this.database.db.insert(localSessions).values({
      id: sessionId,
      userId,
      refreshTokenHash: this.hash(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    return { accessToken: await this.accessToken(userId, sessionId), refreshToken };
  }

  async verifyAccess(authorization?: string): Promise<string> {
    const token = authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw this.invalid();
    try {
      const { payload } = await jwtVerify(token, this.secret(), {
        issuer: 'tucarton-api',
        audience: 'tucarton-mobile',
      });
      if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string') throw this.invalid();
      const session = await this.database.db.query.localSessions.findFirst({
        where: and(
          eq(localSessions.id, payload.sid),
          eq(localSessions.userId, payload.sub),
          isNull(localSessions.revokedAt),
          gt(localSessions.expiresAt, new Date()),
        ),
      });
      if (!session) throw this.invalid();
      return payload.sub;
    } catch {
      throw this.invalid();
    }
  }

  async revoke(refreshToken: string): Promise<void> {
    await this.database.db
      .update(localSessions)
      .set({ revokedAt: new Date() })
      .where(eq(localSessions.refreshTokenHash, this.hash(refreshToken)));
  }

  private async accessToken(userId: string, sessionId: string): Promise<string> {
    return new SignJWT({ sid: sessionId })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuer('tucarton-api')
      .setAudience('tucarton-mobile')
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(this.secret());
  }

  private secret(): Uint8Array {
    const configured = this.config.get<string>('LOCAL_SESSION_SECRET');
    if (configured) return new TextEncoder().encode(configured);
    if (this.config.get<string>('NODE_ENV') === 'production')
      throw new Error('LOCAL_SESSION_SECRET is required.');
    return new TextEncoder().encode('tucarton-local-development-session-secret');
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private invalid(): UnauthorizedException {
    return new UnauthorizedException({
      code: 'SESSION_INVALID',
      message: 'A valid session is required.',
    });
  }
}
