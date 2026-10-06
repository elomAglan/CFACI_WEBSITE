import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateRecruitmentDto } from './dto/create-recruitment.dto';
import { UpdateRecruitmentDto } from './dto/update-recruitment.dto';

@Injectable()
export class RecruitmentService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    createRecruitmentDto: CreateRecruitmentDto,
  ) {
    return this.prisma.recruitment.create({
      data: createRecruitmentDto,
    });
  }

  async findAll() {
    return this.prisma.recruitment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const recruitment =
      await this.prisma.recruitment.findUnique({
        where: { id },
      });

    if (!recruitment) {
      throw new NotFoundException(
        'Offre de recrutement introuvable',
      );
    }

    return recruitment;
  }

  async update(
    id: number,
    updateRecruitmentDto: UpdateRecruitmentDto,
  ) {
    await this.findOne(id);

    return this.prisma.recruitment.update({
      where: { id },
      data: updateRecruitmentDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.recruitment.delete({
      where: { id },
    });

    return {
      message:
        'Offre de recrutement supprimée avec succès',
    };
  }
}