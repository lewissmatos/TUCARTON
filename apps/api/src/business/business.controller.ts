import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { LocalSessionService } from '../auth/local-session.service.js';
import { BusinessService } from './business.service.js';

@Controller({ path: 'businesses', version: '1' })
export class BusinessController {
  constructor(private readonly sessions: LocalSessionService, private readonly business: BusinessService) {}

  @Post()
  async create(@Headers('authorization') auth: string | undefined, @Body('name') name: string) {
    return this.business.create(await this.user(auth), name);
  }

  @Get()
  async list(@Headers('authorization') auth: string | undefined) { return this.business.list(await this.user(auth)); }

  @Post(':businessId/customers')
  async addCustomer(@Headers('authorization') auth: string | undefined, @Param('businessId') businessId: string, @Body('identifier') identifier: string) {
    return this.business.addCustomer(await this.user(auth), businessId, identifier);
  }

  @Get(':businessId/customers')
  async customers(@Headers('authorization') auth: string | undefined, @Param('businessId') businessId: string) {
    return this.business.listCustomers(await this.user(auth), businessId);
  }

  @Post(':businessId/debts')
  async debt(@Headers('authorization') auth: string | undefined, @Param('businessId') businessId: string, @Body() body: { identifier: string; amountMinor: number; note?: string }) {
    return this.business.createDebt(await this.user(auth), businessId, body.identifier, body.amountMinor, body.note);
  }

  @Get(':businessId/debts')
  async debts(@Headers('authorization') auth: string | undefined, @Param('businessId') businessId: string) {
    return this.business.listDebts(await this.user(auth), businessId);
  }

  private user(auth: string | undefined): Promise<string> { return this.sessions.verifyAccess(auth); }
}
