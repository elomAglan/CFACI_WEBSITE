import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRequestDto: CreateRequestDto) {
    return this.prisma.request.create({
      data: createRequestDto,
    });
  }

  async findAll() {
    return this.prisma.request.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.request.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateRequestDto: UpdateRequestDto) {
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