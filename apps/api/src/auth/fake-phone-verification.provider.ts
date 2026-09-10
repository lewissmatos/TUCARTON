import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import type { PhoneVerificationProvider } from './auth.types.js';

interface Challenge {
  userId: string;
  phoneE164: string;
  codeHash: string;
  expiresAt: number;
}

/**
 * Deterministic local provider. It deliberately never sends an SMS. The test
 * code is 000000 and is accepted only before the short local expiry.
 */
@Injectable()
export class FakePhoneVerificationProvider implements PhoneVerificationProvider {
  private readonly challenges = new Map<string, Challenge>();
  private readonly lastStartedAt = new Map<string, number>();

  async start(userId: string, phoneE164: string): Promise<{ verificationId: string }> {
    const existing = [...this.challenges.entries()].find(
      ([, challenge]) =>
        challenge.userId === userId &&
        challenge.phoneE164 === phoneE164 &&
        challenge.expiresAt >= Date.now(),
    );
    if (existing) return { verificationId: existing[0] };

    const lastStartedAt = this.lastStartedAt.get(userId);
    if (lastStartedAt && Date.now() - lastStartedAt < 30_000) {
      throw new HttpException(
        {
          code: 'PHONE_RATE_LIMITED',
          message: 'Please wait before requesting another verification code.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const verificationId = randomUUID();
    this.challenges.set(verificationId, {
      userId,
      phoneE164,
      codeHash: this.hash('000000'),
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    this.lastStartedAt.set(userId, Date.now());
    return { verificationId };
  }

  async verify(
    userId: string,
    verificationId: string,
    code: string,
  ): Promise<{ approved: boolean; phoneE164?: string }> {
    const challenge = this.challenges.get(verificationId);
    if (!challenge || challenge.userId !== userId || challenge.expiresAt < Date.now()) {
      return { approved: false };
    }

    const approved = challenge.codeHash === this.hash(code);
    if (!approved) return { approved: false };
    this.challenges.delete(verificationId);
    return { approved: true, phoneE164: challenge.phoneE164 };
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
