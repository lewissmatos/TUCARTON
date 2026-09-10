import { describe, expect, it } from 'vitest';
import { businessRoles, currencyCodes, transactionStatuses, transactionTypes } from './index.js';

describe('foundation domain vocabulary', () => {
  it('exposes the initial ledger and relationship constants', () => {
    expect(transactionTypes).toEqual(['DEBT', 'PAYMENT', 'REVERSAL']);
    expect(transactionStatuses).toContain('CONFIRMED');
    expect(businessRoles).toEqual(['OWNER', 'MEMBER']);
    expect(currencyCodes).toEqual(['DOP']);
  });
});
