import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../db/database.service.js';
import { authAuditEvents, users } from '../db/schema.js';
import { hashPasscode, isValidPasscode, matchesPasscode } from './passcode.js';
import { normalizeDominicanPhone } from './phone.js';

export interface LocalUser {
  id: string;
  displayName: string | null;
  tuCartonCode: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService) {}

  async register(input: { displayName: string; phone: string; passcode: string }): Promise<LocalUser> {
    const displayName = input.displayName?.trim();
    const phoneE164 = this.requirePhone(input.phone);
    this.requireDisplayName(displayName);
    this.requirePasscode(input.passcode);
    const user = {
      id: randomUUID(),
      authSubject: this.phoneSubject(phoneE164),
      displayName,
      passcodeHash: await hashPasscode(input.passcode),
      phoneE164,
      tuCartonCode: this.createTuCartonCode(),
    };
    try {
      const [created] = await this.database.db.insert(users).values(user).returning();
      await this.audit(created.id, 'ACCOUNT_REGISTERED');
      return this.toLocalUser(created);
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException({
          code: 'PHONE_ALREADY_REGISTERED',
          message: 'Este número ya tiene una cuenta. Inicia sesión.',
        });
      }
      throw error;
    }
  }

  async login(phoneInput: string, passcode: string): Promise<LocalUser> {
    const phoneE164 = this.requirePhone(phoneInput);
    const user = await this.database.db.query.users.findFirst({ where: eq(users.phoneE164, phoneE164) });
    if (!user?.passcodeHash || !(await matchesPasscode(passcode, user.passcodeHash))) {
      throw this.invalidCredentials();
    }
    await this.audit(user.id, 'PASSCODE_LOGIN');
    return this.toLocalUser(user);
  }

  async findById(userId: string): Promise<LocalUser> {
    const user = await this.database.db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) {
      throw new UnauthorizedException({ code: 'SESSION_INVALID', message: 'La sesión no es válida.' });
    }
    return this.toLocalUser(user);
  }

  private requirePhone(input: string): string {
    const phoneE164 = normalizeDominicanPhone(input ?? '');
    if (phoneE164) return phoneE164;
    throw new ConflictException({
      code: 'PHONE_INVALID',
      message: 'Escribe un número dominicano válido.',
    });
  }

  private requireDisplayName(name: string | undefined): asserts name is string {
    if (!name || name.length < 2 || name.length > 120) {
      throw new ConflictException({ code: 'NAME_INVALID', message: 'Escribe tu nombre completo.' });
    }
  }

  private requirePasscode(passcode: string): void {
    if (!isValidPasscode(passcode ?? '')) {
      throw new ConflictException({
        code: 'PASSCODE_INVALID',
        message: 'Tu clave debe tener entre 4 y 6 números.',
      });
    }
  }

  private createTuCartonCode(): string {
    return randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase();
  }

  private phoneSubject(phoneE164: string): string {
    return `phone:${createHash('sha256').update(phoneE164).digest('hex')}`;
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
  }

  private invalidCredentials(): UnauthorizedException {
    return new UnauthorizedException({
      code: 'CREDENTIALS_INVALID',
      message: 'El número o la clave no coinciden.',
    });
  }

  private async audit(userId: string, action: string): Promise<void> {
    await this.database.db.insert(authAuditEvents).values({ id: randomUUID(), userId, action });
  }

  private toLocalUser(user: typeof users.$inferSelect): LocalUser {
    return { id: user.id, displayName: user.displayName, tuCartonCode: user.tuCartonCode };
  }
}
