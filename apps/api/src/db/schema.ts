import { integer, pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  authSubject: text('auth_subject').notNull().unique(),
  tuCartonCode: text('tucarton_code').notNull().unique(),
  displayName: text('display_name'),
  phoneE164: text('phone_e164').unique(),
  passcodeHash: text('passcode_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const authAuditEvents = pgTable('auth_audit_events', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  action: text('action').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const localSessions = pgTable('local_sessions', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  refreshTokenHash: text('refresh_token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const businessMemberRole = pgEnum('business_member_role', ['OWNER', 'MEMBER']);
export const debtStatus = pgEnum('debt_status', ['PENDING_CUSTOMER_ACK', 'CONFIRMED', 'REJECTED']);

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const businessMembers = pgTable(
  'business_members',
  {
    id: uuid('id').primaryKey(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: businessMemberRole('role').notNull().default('MEMBER'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('business_members_business_user').on(table.businessId, table.userId)],
);

export const customerRelationships = pgTable(
  'customer_relationships',
  {
    id: uuid('id').primaryKey(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id),
    customerUserId: uuid('customer_user_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('customer_relationships_business_customer').on(table.businessId, table.customerUserId),
  ],
);

export const debts = pgTable('debts', {
  id: uuid('id').primaryKey(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id),
  customerUserId: uuid('customer_user_id')
    .notNull()
    .references(() => users.id),
  createdByUserId: uuid('created_by_user_id')
    .notNull()
    .references(() => users.id),
  amountMinor: integer('amount_minor').notNull(),
  currency: text('currency').notNull().default('DOP'),
  note: text('note'),
  status: debtStatus('status').notNull().default('PENDING_CUSTOMER_ACK'),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  rejectedByUserId: uuid('rejected_by_user_id').references(() => users.id),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
