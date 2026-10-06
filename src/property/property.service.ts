import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

interface UploadedFile {
  filename: string;
}

@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPropertyDto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: createPropertyDto,
      include: {
        media: true,
      },
    });
  }

  async findAll() {
    return this.prisma.property.findMany({
      include: {
        media: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        media: true,
      },
    });

    if (!property) {
      throw new NotFoundException('Propriété introuvable');
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

    const url = `/uploads/properties/${propertyId}/${file.filename}`;

    return this.prisma.propertyMedia.create({
      data: {
        url,
        propertyId,
      },
    });
  }
}