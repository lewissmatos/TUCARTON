import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DatabaseService } from '../db/database.service.js';
import { businessMembers, businesses, customerRelationships, debts, users } from '../db/schema.js';
import { calculateLedgerSummary, paginateLedgerHistory } from './ledger-calculator.js';

@Injectable()
export class LedgerService {
  constructor(private readonly database: DatabaseService) {}

  async pendingForCustomer(userId: string) {
    const records = await this.database.db
      .select()
      .from(debts)
      .where(and(eq(debts.customerUserId, userId), eq(debts.status, 'PENDING_CUSTOMER_ACK')));
    return records.map((record) => this.toLedgerDebt(record));
  }

  async customerRelationships(userId: string) {
    return this.database.db
      .select({ businessId: businesses.id, businessName: businesses.name })
      .from(customerRelationships)
      .innerJoin(businesses, eq(businesses.id, customerRelationships.businessId))
      .where(eq(customerRelationships.customerUserId, userId));
  }

  async confirmDebt(userId: string, debtId: string) {
    const debt = await this.findCustomerDebt(userId, debtId);
    if (debt.status !== 'PENDING_CUSTOMER_ACK') return this.toLedgerDebt(debt);
    const [confirmed] = await this.database.db
      .update(debts)
      .set({ confirmedAt: new Date(), status: 'CONFIRMED' })
      .where(eq(debts.id, debtId))
      .returning();
    return this.toLedgerDebt(confirmed);
  }

  async rejectDebt(userId: string, debtId: string, reasonInput?: string) {
    const debt = await this.findCustomerDebt(userId, debtId);
    if (debt.status !== 'PENDING_CUSTOMER_ACK') {
      throw new ConflictException('Este pendiente ya fue decidido.');
    }
    const reason = reasonInput?.trim() || null;
    if (reason && reason.length > 500) {
      throw new ConflictException('La razón no puede superar 500 caracteres.');
    }
    const [rejected] = await this.database.db
      .update(debts)
      .set({
        rejectedAt: new Date(),
        rejectedByUserId: userId,
        rejectionReason: reason,
        status: 'REJECTED',
      })
      .where(eq(debts.id, debtId))
      .returning();
    return this.toLedgerDebt(rejected);
  }

  async businessRelationshipLedger(
    userId: string,
    businessId: string,
    customerCode: string,
    limit?: number,
    cursor?: string,
  ) {
    const member = await this.database.db.query.businessMembers.findFirst({
      where: and(eq(businessMembers.businessId, businessId), eq(businessMembers.userId, userId)),
    });
    if (!member) throw this.relationshipNotFound();
    const customer = await this.database.db.query.users.findFirst({
      where: eq(users.tuCartonCode, customerCode.trim().toUpperCase()),
    });
    if (!customer) throw this.relationshipNotFound();
    return this.relationshipLedger(businessId, customer.id, limit, cursor);
  }

  async customerRelationshipLedger(
    userId: string,
    businessId: string,
    limit?: number,
    cursor?: string,
  ) {
    return this.relationshipLedger(businessId, userId, limit, cursor);
  }

  private async relationshipLedger(
    businessId: string,
    customerUserId: string,
    limit?: number,
    cursor?: string,
  ) {
    const relationship = await this.database.db.query.customerRelationships.findFirst({
      where: and(
        eq(customerRelationships.businessId, businessId),
        eq(customerRelationships.customerUserId, customerUserId),
      ),
    });
    if (!relationship) throw this.relationshipNotFound();
    const records = await this.database.db
      .select()
      .from(debts)
      .where(and(eq(debts.businessId, businessId), eq(debts.customerUserId, customerUserId)));
    const ledgerDebts = records.map((record) => this.toLedgerDebt(record));
    let history;
    try {
      history = paginateLedgerHistory(ledgerDebts, limit, cursor);
    } catch {
      throw new BadRequestException('Cursor de historial inválido.');
    }
    return {
      relationship: { businessId, customerUserId },
      summary: calculateLedgerSummary(ledgerDebts),
      history,
    };
  }

  private async findCustomerDebt(userId: string, debtId: string) {
    const debt = await this.database.db.query.debts.findFirst({ where: eq(debts.id, debtId) });
    if (!debt || debt.customerUserId !== userId) {
      throw new ForbiddenException('Solo la persona indicada puede decidir este pendiente.');
    }
    return debt;
  }

  private relationshipNotFound(): NotFoundException {
    return new NotFoundException('No encontramos esta relación.');
  }

  private toLedgerDebt(record: typeof debts.$inferSelect) {
    return {
      id: record.id,
      amountMinor: record.amountMinor,
      currency: record.currency,
      note: record.note,
      status: record.status,
      createdAt: record.createdAt,
      confirmedAt: record.confirmedAt,
      rejectedAt: record.rejectedAt,
      rejectedByUserId: record.rejectedByUserId,
      rejectionReason: record.rejectionReason,
    };
  }
}
