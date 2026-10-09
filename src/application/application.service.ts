import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationQueryDto } from './dto/application-query.dto';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    recruitmentId: number,
    createApplicationDto: CreateApplicationDto,
    cvUrl?: string,
  ) {
    const recruitment =
      await this.prisma.recruitment.findUnique({
        where: { id: recruitmentId },
      });

    if (!recruitment) {
      throw new NotFoundException(
        'Offre de recrutement introuvable',
      );
    }

    if (recruitment.status !== 'OPEN') {
      throw new BadRequestException(
        'Cette offre de recrutement est fermée',
      );
    }

    return this.prisma.application.create({
      data: {
        ...createApplicationDto,
        cvUrl: cvUrl ?? null,
        recruitmentId,
      },
      include: {
        recruitment: {
          select: {
            id: true,
            title: true,
            contractType: true,
            location: true,
          },
        },
      },
    });
  }

  async findAll(query: ApplicationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const where = {
      ...(query.recruitmentId
        ? { recruitmentId: query.recruitmentId }
        : {}),
      ...(search
        ? {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                lastName: {
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
                message: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                recruitment: {
                  title: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          recruitment: {
            select: {
              id: true,
              title: true,
              contractType: true,
              location: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.application.count({
        where,
      }),
    ]);

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const application =
      await this.prisma.application.findUnique({
        where: { id },
        include: {
          recruitment: {
            select: {
              id: true,
              title: true,
              description: true,
              contractType: true,
              status: true,
              location: true,
            },
          },
        },
      });

    if (!application) {
      throw new NotFoundException(
        'Candidature introuvable',
      );
    }

    return application;
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.application.delete({
      where: { id },
    });

    return {
      message: 'Candidature supprimée avec succès',
    };
  }
}