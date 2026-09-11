import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { LocalSessionService } from './local-session.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalSessionService],
  exports: [LocalSessionService],
})
export class AuthModule {}
