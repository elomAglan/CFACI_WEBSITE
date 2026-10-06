import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestQueryDto } from './dto/request-query.dto';

@Injectable()
export class RequestService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    createRequestDto: CreateRequestDto,
    userId?: number,
  ) {
    return this.prisma.request.create({
      data: {
        ...createRequestDto,
        clientId: userId ?? null,
      },
    });
  }

  async findAll(query: RequestQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const where = {
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                phone: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                subject: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                message: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),

      ...(query.status
        ? {
            status: query.status,
          }
        : {}),
    };

    const [requests, total] = await Promise.all([
      this.prisma.request.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.request.count({
        where,
      }),
    ]);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    return this.prisma.request.findUnique({
      where: { id },
    });
  }

  async findMyRequests(userId: number) {
    return this.prisma.request.findMany({
      where: {
        clientId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: number,
    updateRequestDto: UpdateRequestDto,
  ) {
    return this.prisma.request.update({
      where: { id },
      data: updateRequestDto,
    });
  }

  async remove(id: number) {
    return this.prisma.request.delete({
      where: { id },
    });
  }
}