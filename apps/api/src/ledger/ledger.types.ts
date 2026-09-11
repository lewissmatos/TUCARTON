export type LedgerDebtStatus = 'PENDING_CUSTOMER_ACK' | 'CONFIRMED' | 'REJECTED';

export interface LedgerDebt {
  id: string;
  amountMinor: number;
  currency: string;
  note: string | null;
  status: LedgerDebtStatus;
  createdAt: Date;
  confirmedAt: Date | null;
  rejectedAt: Date | null;
  rejectedByUserId: string | null;
  rejectionReason: string | null;
}

export interface LedgerSummary {
  currency: 'DOP';
  confirmedBalanceMinor: number;
  pendingDebtMinor: number;
  rejectedDebtMinor: number;
}

export interface LedgerHistoryPage {
  items: LedgerDebt[];
  nextCursor: string | null;
}
