import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthTokenVerifier } from './auth-token-verifier.service.js';
import { FakePhoneVerificationProvider } from './fake-phone-verification.provider.js';
import { LocalSessionService } from './local-session.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthTokenVerifier, FakePhoneVerificationProvider, LocalSessionService],
})
export class AuthModule {}
