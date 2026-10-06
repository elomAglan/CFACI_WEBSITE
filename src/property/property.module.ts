import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';

@Module({
  imports: [PrismaModule],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}