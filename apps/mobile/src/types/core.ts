export interface User {
  displayName: string | null;
  tuCartonCode: string;
}
export interface Business {
  id: string;
  name: string;
}
export interface Customer {
  displayName: string | null;
  relationshipId: string;
  tuCartonCode: string;
}
export interface Debt {
  id: string;
  amountMinor: number;
  note: string | null;
  status: string;
  createdAt: string;
  confirmedAt: string | null;
  rejectedAt: string | null;
  rejectedByUserId: string | null;
  rejectionReason: string | null;
}

export interface LedgerSummary {
  currency: 'DOP';
  confirmedBalanceMinor: number;
  pendingDebtMinor: number;
  rejectedDebtMinor: number;
}

export interface LedgerHistory {
  items: Debt[];
  nextCursor: string | null;
}

export interface RelationshipLedger {
  relationship: { businessId: string; customerUserId: string };
  summary: LedgerSummary;
  history: LedgerHistory;
}

export interface CustomerRelationship {
  businessId: string;
  businessName: string;
}
export interface Session {
  accessToken: string;
  refreshToken: string;
  user: User;
}
