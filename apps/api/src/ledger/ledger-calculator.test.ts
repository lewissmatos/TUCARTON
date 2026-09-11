import { describe, expect, it } from 'vitest';
import { calculateLedgerSummary, paginateLedgerHistory } from './ledger-calculator.js';
import type { LedgerDebt } from './ledger.types.js';

function debt(
  id: string,
  status: LedgerDebt['status'],
  createdAt: string,
  amountMinor = 1000,
): LedgerDebt {
  return {
    amountMinor,
    confirmedAt: status === 'CONFIRMED' ? new Date(createdAt) : null,
    createdAt: new Date(createdAt),
    currency: 'DOP',
    id,
    note: null,
    rejectedAt: status === 'REJECTED' ? new Date(createdAt) : null,
    rejectedByUserId: status === 'REJECTED' ? 'customer-id' : null,
    rejectionReason: null,
    status,
  };
}

describe('calculateLedgerSummary', () => {
  it('counts only confirmed debts in the confirmed balance', () => {
    const summary = calculateLedgerSummary([
      debt('confirmed', 'CONFIRMED', '2026-09-10T10:00:00.000Z', 200_00),
      debt('pending', 'PENDING_CUSTOMER_ACK', '2026-09-10T09:00:00.000Z', 50_00),
      debt('rejected', 'REJECTED', '2026-09-10T08:00:00.000Z', 30_00),
    ]);

    expect(summary).toEqual({
      confirmedBalanceMinor: 200_00,
      currency: 'DOP',
      pendingDebtMinor: 50_00,
      rejectedDebtMinor: 30_00,
    });
  });
});

describe('paginateLedgerHistory', () => {
  it('uses stable newest-first pages without duplicate records', () => {
    const records = [
      debt('a', 'CONFIRMED', '2026-09-10T10:00:00.000Z'),
      debt('b', 'PENDING_CUSTOMER_ACK', '2026-09-10T10:00:00.000Z'),
      debt('c', 'REJECTED', '2026-09-10T09:00:00.000Z'),
    ];

    const first = paginateLedgerHistory(records, 2);
    const second = paginateLedgerHistory(records, 2, first.nextCursor ?? undefined);

    expect(first.items.map((item) => item.id)).toEqual(['b', 'a']);
    expect(second.items.map((item) => item.id)).toEqual(['c']);
    expect(new Set([...first.items, ...second.items].map((item) => item.id))).toHaveLength(3);
    expect(second.nextCursor).toBeNull();
  });
});
