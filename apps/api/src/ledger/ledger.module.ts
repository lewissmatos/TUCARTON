import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { BusinessLedgerController, CustomerLedgerController } from './ledger.controller.js';
import { LedgerService } from './ledger.service.js';

@Module({
  imports: [AuthModule],
  controllers: [BusinessLedgerController, CustomerLedgerController],
  providers: [LedgerService],
})
export class LedgerModule {}
