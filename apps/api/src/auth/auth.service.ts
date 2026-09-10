import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../db/database.service.js';
import { authAuditEvents, users } from '../db/schema.js';
import type { AuthenticatedIdentity } from './auth.types.js';
import { FakePhoneVerificationProvider } from './fake-phone-verification.provider.js';

export interface LocalUser {
  id: string;
  authSubject: string;
  tuCartonCode: string;
  phoneVerifiedAt: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly phoneProvider: FakePhoneVerificationProvider,
  ) {}

  async bootstrap(identity: AuthenticatedIdentity): Promise<LocalUser> {
    const existing = await this.database.db.query.users.findFirst({
      where: eq(users.authSubject, identity.subject),
    });
    if (existing) return this.toLocalUser(existing);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const user = {
        id: randomUUID(),
        authSubject: identity.subject,
        tuCartonCode: this.createTuCartonCode(),
      };
      try {
        const [created] = await this.database.db.insert(users).values(user).returning();
        await this.audit(created.id, 'AUTH_BOOTSTRAPPED');
        return this.toLocalUser(created);
      } catch (error: unknown) {
        if (!this.isUniqueViolation(error) || attempt === 4) throw error;
        const concurrent = await this.database.db.query.users.findFirst({
          where: eq(users.authSubject, identity.subject),
        });
        if (concurrent) return this.toLocalUser(concurrent);
      }
    }
    throw new Error('Unable to create a local user.');
  }

  async startPhoneVerification(
    user: LocalUser,
    phoneE164: string,
  ): Promise<{ verificationId: string }> {
    if (!/^\+[1-9]\d{7,14}$/.test(phoneE164)) {
      throw new UnauthorizedException({
        code: 'PHONE_INVALID',
        message: 'A valid E.164 phone number is required.',
      });
    }
    return this.phoneProvider.start(user.id, phoneE164);
  }

  async startPhoneAccess(
    phoneInput: string,
  ): Promise<{ verificationId: string; phoneE164: string }> {
    const phoneE164 = this.normalizePhone(phoneInput);
    return {
      ...(await this.phoneProvider.start(this.phoneSubject(phoneE164), phoneE164)),
      phoneE164,
    };
  }

  async verifyPhoneAccess(
    phoneInput: string,
    verificationId: string,
    code: string,
  ): Promise<LocalUser> {
    const phoneE164 = this.normalizePhone(phoneInput);
    const result = await this.phoneProvider.verify(
      this.phoneSubject(phoneE164),
      verificationId,
      code,
    );
    if (!result.approved || result.phoneE164 !== phoneE164) {
      throw new UnauthorizedException({
        code: 'PHONE_CODE_INVALID',
        message: 'The verification code is invalid or expired.',
      });
    }

    const existing = await this.database.db.query.users.findFirst({
      where: eq(users.phoneE164, phoneE164),
    });
    if (existing) {
      await this.audit(existing.id, 'PHONE_ACCESS_RESTORED');
      return this.toLocalUser(existing);
    }

    const user = {
      id: randomUUID(),
      authSubject: this.phoneSubject(phoneE164),
      phoneE164,
      phoneVerifiedAt: new Date(),
      tuCartonCode: this.createTuCartonCode(),
    };
    try {
      const [created] = await this.database.db.insert(users).values(user).returning();
      await this.audit(created.id, 'PHONE_ACCOUNT_CREATED');
      return this.toLocalUser(created);
    } catch (error: unknown) {
      if (!this.isUniqueViolation(error)) throw error;
      const concurrent = await this.database.db.query.users.findFirst({
        where: eq(users.phoneE164, phoneE164),
      });
      if (concurrent) return this.toLocalUser(concurrent);
      throw error;
    }
  }

  async findById(userId: string): Promise<LocalUser> {
    const user = await this.database.db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user)
      throw new UnauthorizedException({ code: 'SESSION_INVALID', message: 'Session is invalid.' });
    return this.toLocalUser(user);
  }

  async verifyPhone(user: LocalUser, verificationId: string, code: string): Promise<LocalUser> {
    const result = await this.phoneProvider.verify(user.id, verificationId, code);
    if (!result.approved) {
      throw new UnauthorizedException({
        code: 'PHONE_CODE_INVALID',
        message: 'The verification code is invalid or expired.',
      });
    }
    let updated: typeof users.$inferSelect;
    try {
      const [record] = await this.database.db
        .update(users)
        .set({
          phoneE164: result.phoneE164,
          phoneVerifiedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();
      updated = record;
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException({
          code: 'PHONE_ALREADY_VERIFIED',
          message: 'This phone number is already verified on another account.',
        });
      }
      throw error;
    }
    await this.audit(updated.id, 'PHONE_VERIFIED');
    return this.toLocalUser(updated);
  }

  private createTuCartonCode(): string {
    return randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase();
  }

  private normalizePhone(input: string): string {
    const compact = input.trim().replace(/[\s().-]/g, '');
    const digits = compact.replace(/^\+/, '');
    const dominicanLocal = /^(809|829|849)\d{7}$/.test(digits);
    const phoneE164 = dominicanLocal
      ? `+1${digits}`
      : compact.startsWith('+')
        ? `+${digits}`
        : `+${digits}`;
    if (!/^\+[1-9]\d{7,14}$/.test(phoneE164)) {
      throw new UnauthorizedException({
        code: 'PHONE_INVALID',
        message: 'A valid phone number is required.',
      });
    }
    return phoneE164;
  }

  private phoneSubject(phoneE164: string): string {
    return `phone:${createHash('sha256').update(phoneE164).digest('hex')}`;
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
  }

  private async audit(userId: string, action: string): Promise<void> {
    await this.database.db.insert(authAuditEvents).values({ id: randomUUID(), userId, action });
  }

  private toLocalUser(user: typeof users.$inferSelect): LocalUser {
    return {
      id: user.id,
      authSubject: user.authSubject,
      tuCartonCode: user.tuCartonCode,
      phoneVerifiedAt: user.phoneVerifiedAt?.toISOString() ?? null,
    };
  }
}
