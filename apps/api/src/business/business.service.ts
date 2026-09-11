import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../db/database.service.js';
import { businessMembers, businesses, customerRelationships, debts, users } from '../db/schema.js';
import { looksLikePhoneIdentifier, normalizeDominicanPhone } from '../auth/phone.js';

@Injectable()
export class BusinessService {
  constructor(private readonly database: DatabaseService) {}

  async create(userId: string, nameInput: string) {
    const name = nameInput?.trim();
    if (!name || name.length > 120) throw new ConflictException('Escribe un nombre válido para el negocio.');
    return this.database.db.transaction(async (tx) => {
      const [business] = await tx.insert(businesses).values({ id: randomUUID(), name }).returning();
      await tx.insert(businessMembers).values({ id: randomUUID(), businessId: business.id, userId, role: 'OWNER' });
      return business;
    });
  }

  async list(userId: string) {
    return this.database.db
      .select({ id: businesses.id, name: businesses.name, createdAt: businesses.createdAt, role: businessMembers.role })
      .from(businessMembers)
      .innerJoin(businesses, eq(businesses.id, businessMembers.businessId))
      .where(eq(businessMembers.userId, userId))
      .orderBy(desc(businesses.createdAt));
  }

  async addCustomer(userId: string, businessId: string, identifierInput: string) {
    await this.requireMember(userId, businessId);
    const customer = await this.findCustomer(identifierInput);
    if (!customer) throw new NotFoundException('No encontramos un cliente con ese código o número.');
    if (customer.id === userId) throw new ConflictException('No puedes agregarte a ti mismo.');
    try {
      const [relationship] = await this.database.db
        .insert(customerRelationships)
        .values({ id: randomUUID(), businessId, customerUserId: customer.id })
        .returning();
      return {
        ...relationship,
        customer: { displayName: customer.displayName, tuCartonCode: customer.tuCartonCode },
      };
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) throw new ConflictException('Este cliente ya está agregado.');
      throw error;
    }
  }

  async listCustomers(userId: string, businessId: string) {
    await this.requireMember(userId, businessId);
    return this.database.db
      .select({
        relationshipId: customerRelationships.id,
        displayName: users.displayName,
        tuCartonCode: users.tuCartonCode,
      })
      .from(customerRelationships)
      .innerJoin(users, eq(users.id, customerRelationships.customerUserId))
      .where(eq(customerRelationships.businessId, businessId));
  }

  async createDebt(
    userId: string,
    businessId: string,
    customerIdentifier: string,
    amountMinor: number,
    note?: string,
  ) {
    await this.requireMember(userId, businessId);
    if (!Number.isInteger(amountMinor) || amountMinor <= 0) throw new ConflictException('El monto debe ser mayor que cero.');
    const customer = await this.findCustomer(customerIdentifier);
    if (!customer) throw new NotFoundException('No encontramos un cliente con ese código o número.');
    const relationship = await this.database.db.query.customerRelationships.findFirst({
      where: and(eq(customerRelationships.businessId, businessId), eq(customerRelationships.customerUserId, customer.id)),
    });
    if (!relationship) throw new ConflictException('Agrega primero a este cliente al negocio.');
    const [debt] = await this.database.db.insert(debts).values({
      id: randomUUID(), businessId, customerUserId: customer.id, createdByUserId: userId,
      amountMinor, note: note?.trim() || null, currency: 'DOP', status: 'PENDING_CUSTOMER_ACK',
    }).returning();
    return debt;
  }

  async listDebts(userId: string, businessId: string) {
    await this.requireMember(userId, businessId);
    return this.database.db.select().from(debts).where(eq(debts.businessId, businessId)).orderBy(desc(debts.createdAt));
  }

  async pendingForCustomer(userId: string) {
    return this.database.db.select().from(debts).where(and(eq(debts.customerUserId, userId), eq(debts.status, 'PENDING_CUSTOMER_ACK'))).orderBy(desc(debts.createdAt));
  }

  async acknowledge(userId: string, debtId: string) {
    const debt = await this.database.db.query.debts.findFirst({ where: eq(debts.id, debtId) });
    if (!debt) throw new NotFoundException('No encontramos ese registro.');
    if (debt.customerUserId !== userId) throw new ForbiddenException('Solo la otra persona puede confirmar este registro.');
    if (debt.status !== 'PENDING_CUSTOMER_ACK') return debt;
    const [confirmed] = await this.database.db.update(debts).set({ status: 'CONFIRMED', confirmedAt: new Date() }).where(eq(debts.id, debtId)).returning();
    return confirmed;
  }

  private async requireMember(userId: string, businessId: string) {
    const member = await this.database.db.query.businessMembers.findFirst({ where: and(eq(businessMembers.businessId, businessId), eq(businessMembers.userId, userId)) });
    if (!member) throw new ForbiddenException('No tienes acceso a este negocio.');
    return member;
  }

  private async findCustomer(identifierInput: string) {
    const identifier = identifierInput?.trim();
    if (!identifier) return undefined;
    if (looksLikePhoneIdentifier(identifier)) {
      const phoneE164 = normalizeDominicanPhone(identifier);
      if (!phoneE164) return undefined;
      return this.database.db.query.users.findFirst({ where: eq(users.phoneE164, phoneE164) });
    }
    return this.database.db.query.users.findFirst({
      where: eq(users.tuCartonCode, identifier.toUpperCase()),
    });
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
  }
}
