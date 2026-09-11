import { Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { LocalSessionService } from '../auth/local-session.service.js';
import { BusinessService } from './business.service.js';

@Controller({ path: 'customer', version: '1' })
export class CustomerDebtController {
  constructor(private readonly sessions: LocalSessionService, private readonly business: BusinessService) {}

  @Get('debts/pending')
  async pending(@Headers('authorization') auth: string | undefined) { return this.business.pendingForCustomer(await this.user(auth)); }

  @Post('debts/:debtId/acknowledge')
  async acknowledge(@Headers('authorization') auth: string | undefined, @Param('debtId') debtId: string) {
    return this.business.acknowledge(await this.user(auth), debtId);
  }

  private user(auth: string | undefined): Promise<string> { return this.sessions.verifyAccess(auth); }
}
