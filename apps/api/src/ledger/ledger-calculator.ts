import type { LedgerDebt, LedgerHistoryPage, LedgerSummary } from './ledger.types.js';

interface HistoryCursor {
  createdAt: string;
  id: string;
}

export function calculateLedgerSummary(debts: LedgerDebt[]): LedgerSummary {
  return debts.reduce<LedgerSummary>(
    (summary, debt) => {
      if (debt.status === 'CONFIRMED') summary.confirmedBalanceMinor += debt.amountMinor;
      if (debt.status === 'PENDING_CUSTOMER_ACK') summary.pendingDebtMinor += debt.amountMinor;
      if (debt.status === 'REJECTED') summary.rejectedDebtMinor += debt.amountMinor;
      return summary;
    },
    { currency: 'DOP', confirmedBalanceMinor: 0, pendingDebtMinor: 0, rejectedDebtMinor: 0 },
  );
}

export function paginateLedgerHistory(
  debts: LedgerDebt[],
  limitInput?: number,
  cursorInput?: string,
): LedgerHistoryPage {
  const limit = Math.min(Math.max(limitInput ?? 20, 1), 50);
  const cursor = cursorInput ? parseCursor(cursorInput) : null;
  const sorted = [...debts].sort(compareDebt);
  const afterCursor = cursor
    ? sorted.filter(
        (debt) => compareDebt(debt, { id: cursor.id, createdAt: new Date(cursor.createdAt) }) > 0,
      )
    : sorted;
  const items = afterCursor.slice(0, limit);
  const finalItem = items.at(-1);
  return {
    items,
    nextCursor: finalItem && afterCursor.length > items.length ? createCursor(finalItem) : null,
  };
}

function compareDebt(
  left: Pick<LedgerDebt, 'id' | 'createdAt'>,
  right: Pick<LedgerDebt, 'id' | 'createdAt'>,
): number {
  const byDate = right.createdAt.getTime() - left.createdAt.getTime();
  if (byDate !== 0) return byDate;
  return right.id.localeCompare(left.id);
}

function createCursor(debt: Pick<LedgerDebt, 'id' | 'createdAt'>): string {
  return Buffer.from(
    JSON.stringify({ createdAt: debt.createdAt.toISOString(), id: debt.id }),
  ).toString('base64url');
}

function parseCursor(cursor: string): HistoryCursor {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as HistoryCursor;
    if (!parsed.id || Number.isNaN(new Date(parsed.createdAt).getTime()))
      throw new Error('invalid');
    return parsed;
  } catch {
    throw new Error('Cursor de historial inválido.');
  }
}
