import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

@Module({
  imports: [PrismaModule],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}