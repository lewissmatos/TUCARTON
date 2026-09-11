import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { LocalSessionService } from '../auth/local-session.service.js';
import { LedgerService } from './ledger.service.js';

@Controller({ path: 'businesses', version: '1' })
export class BusinessLedgerController {
  constructor(
    private readonly sessions: LocalSessionService,
    private readonly ledger: LedgerService,
  ) {}

  @Get(':businessId/customers/:customerCode/ledger')
  async relationshipLedger(
    @Headers('authorization') authorization: string | undefined,
    @Param('businessId') businessId: string,
    @Param('customerCode') customerCode: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.ledger.businessRelationshipLedger(
      await this.user(authorization),
      businessId,
      customerCode,
      this.limit(limit),
      cursor,
    );
  }

  private user(authorization: string | undefined): Promise<string> {
    return this.sessions.verifyAccess(authorization);
  }

  private limit(input?: string): number | undefined {
    if (input === undefined) return undefined;
    const parsed = Number(input);
    return Number.isInteger(parsed) ? parsed : undefined;
  }
}

@Controller({ path: 'customer', version: '1' })
export class CustomerLedgerController {
  constructor(
    private readonly sessions: LocalSessionService,
    private readonly ledger: LedgerService,
  ) {}

  @Get('debts/pending')
  async pending(@Headers('authorization') authorization: string | undefined) {
    return this.ledger.pendingForCustomer(await this.user(authorization));
  }

  @Get('relationships')
  async relationships(@Headers('authorization') authorization: string | undefined) {
    return this.ledger.customerRelationships(await this.user(authorization));
  }

  @Post('debts/:debtId/acknowledge')
  async acknowledge(
    @Headers('authorization') authorization: string | undefined,
    @Param('debtId') debtId: string,
  ) {
    return this.ledger.confirmDebt(await this.user(authorization), debtId);
  }

  @Post('debts/:debtId/reject')
  async reject(
    @Headers('authorization') authorization: string | undefined,
    @Param('debtId') debtId: string,
    @Body('reason') reason?: string,
  ) {
    return this.ledger.rejectDebt(await this.user(authorization), debtId, reason);
  }

  @Get('businesses/:businessId/ledger')
  async relationshipLedger(
    @Headers('authorization') authorization: string | undefined,
    @Param('businessId') businessId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.ledger.customerRelationshipLedger(
      await this.user(authorization),
      businessId,
      this.limit(limit),
      cursor,
    );
  }

  private user(authorization: string | undefined): Promise<string> {
    return this.sessions.verifyAccess(authorization);
  }

  private limit(input?: string): number | undefined {
    if (input === undefined) return undefined;
    const parsed = Number(input);
    return Number.isInteger(parsed) ? parsed : undefined;
  }
}
