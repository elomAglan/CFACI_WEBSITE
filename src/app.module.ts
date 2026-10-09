import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module';
import { PropertyModule } from './property/property.module';
import { RequestModule } from './request/request.module';
import { UserModule } from './user/user.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PropertyModule,
    RequestModule,
    UserModule,
    DashboardModule,
    RecruitmentModule,
    ApplicationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}