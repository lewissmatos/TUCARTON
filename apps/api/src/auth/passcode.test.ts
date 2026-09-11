import { describe, expect, it } from 'vitest';
import { hashPasscode, isValidPasscode, matchesPasscode } from './passcode.js';

describe('passcode credentials', () => {
  it('accepts only a four-to-six digit passcode', () => {
    expect(isValidPasscode('1234')).toBe(true);
    expect(isValidPasscode('123456')).toBe(true);
    expect(isValidPasscode('123')).toBe(false);
    expect(isValidPasscode('1234567')).toBe(false);
    expect(isValidPasscode('12ab')).toBe(false);
  });

  it('derives a salted value that only matches the original passcode', async () => {
    const stored = await hashPasscode('123456');
    expect(stored).not.toContain('123456');
    await expect(matchesPasscode('123456', stored)).resolves.toBe(true);
    await expect(matchesPasscode('654321', stored)).resolves.toBe(false);
  });
});
