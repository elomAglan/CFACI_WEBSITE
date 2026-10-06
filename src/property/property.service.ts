import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyQueryDto } from './dto/property-query.dto';

interface UploadedFile {
  filename: string;
}

@Injectable()
export class PropertyService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(createPropertyDto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: createPropertyDto,
      include: {
        media: true,
      },
    });
  }

  async findAll(query: PropertyQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const where = search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              description: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              category: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              city: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              district: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: {
          media: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.property.count({
        where,
      }),
    ]);

    return {
      data: properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        media: true,
      },
    });

    if (!property) {
      throw new NotFoundException(
        'Propriété introuvable',
      );
    }

    return property;
  }

  async update(
    id: number,
    updatePropertyDto: UpdatePropertyDto,
  ) {
    await this.findOne(id);

    return this.prisma.property.update({
      where: { id },
      data: updatePropertyDto,
      include: {
        media: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.property.delete({
      where: { id },
    });

    return {
      message: 'Propriété supprimée avec succès',
    };
  }

  async addMedia(
    propertyId: number,
    file: UploadedFile,
  ) {
    await this.findOne(propertyId);

    const url =
      `/uploads/properties/${propertyId}/${file.filename}`;

    return this.prisma.propertyMedia.create({
      data: {
        url,
        propertyId,
      },
    });
  }
}