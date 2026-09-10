import { describe, expect, it } from 'vitest';
import { FakePhoneVerificationProvider } from './fake-phone-verification.provider.js';

describe('FakePhoneVerificationProvider', () => {
  it('accepts the deterministic code once and returns the originating phone number', async () => {
    const provider = new FakePhoneVerificationProvider();
    const challenge = await provider.start('user-1', '+18095551234');

    await expect(provider.verify('user-1', challenge.verificationId, '111111')).resolves.toEqual({
      approved: false,
    });
    await expect(provider.verify('user-1', challenge.verificationId, '000000')).resolves.toEqual({
      approved: true,
      phoneE164: '+18095551234',
    });
    await expect(provider.verify('user-1', challenge.verificationId, '000000')).resolves.toEqual({
      approved: false,
    });
  });
});
