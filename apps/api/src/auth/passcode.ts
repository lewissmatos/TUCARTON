import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

export function isValidPasscode(passcode: string): boolean {
  return /^\d{4,6}$/.test(passcode);
}

export async function hashPasscode(passcode: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await scrypt(passcode, salt, 64)) as Buffer;
  return `${salt.toString('base64url')}:${key.toString('base64url')}`;
}

export async function matchesPasscode(passcode: string, stored: string): Promise<boolean> {
  if (!isValidPasscode(passcode)) return false;
  const [saltValue, keyValue] = stored.split(':');
  if (!saltValue || !keyValue) return false;
  try {
    const salt = Buffer.from(saltValue, 'base64url');
    const expected = Buffer.from(keyValue, 'base64url');
    const actual = (await scrypt(passcode, salt, expected.length)) as Buffer;
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
