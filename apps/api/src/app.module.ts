import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { BusinessModule } from './business/business.module.js';
import { DatabaseModule } from './db/database.module.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    AuthModule,
    BusinessModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
