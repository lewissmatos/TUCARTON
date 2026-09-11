export function normalizeDominicanPhone(input: string): string | null {
  const compact = input.trim().replace(/[\s().-]/g, '');
  const digits = compact.replace(/^\+/, '');
  const localMatch = /^(809|829|849)\d{7}$/.test(digits);
  const countryMatch = /^1(809|829|849)\d{7}$/.test(digits);
  if (!localMatch && !countryMatch) return null;
  return `+1${localMatch ? digits : digits.slice(1)}`;
}

export function looksLikePhoneIdentifier(input: string): boolean {
  return /^[+\d\s().-]+$/.test(input.trim());
}
