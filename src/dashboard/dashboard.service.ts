import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getStats() {
    const [
      users,
      clients,
      properties,
      requests,
      newRequests,
    ] = await Promise.all([
      this.prisma.user.count(),

      this.prisma.user.count({
        where: {
          role: 'CLIENT',
        },
      }),

      this.prisma.property.count(),

      this.prisma.request.count(),

      this.prisma.request.count({
        where: {
          status: 'NEW',
        },
      }),
    ]);

    return {
      users,
      clients,
      properties,
      requests,
      newRequests,
    };
  }
}