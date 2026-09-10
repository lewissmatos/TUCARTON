/**
 * Framework-independent vocabulary only. Ledger behavior is introduced by a
 * later approved work item; neither mobile nor API implementation belongs here.
 */
export const transactionTypes = ['DEBT', 'PAYMENT', 'REVERSAL'] as const;
export type TransactionType = (typeof transactionTypes)[number];

export const transactionStatuses = [
  'PENDING',
  'CONFIRMED',
  'REJECTED',
  'CANCELED',
  'EXPIRED',
] as const;
export type TransactionStatus = (typeof transactionStatuses)[number];

export const businessRoles = ['OWNER', 'MEMBER'] as const;
export type BusinessRole = (typeof businessRoles)[number];

export const syncStatuses = ['PENDING', 'SYNCHRONIZED', 'CONFLICT', 'REJECTED'] as const;
export type SyncStatus = (typeof syncStatuses)[number];

export const currencyCodes = ['DOP'] as const;
export type CurrencyCode = (typeof currencyCodes)[number];
