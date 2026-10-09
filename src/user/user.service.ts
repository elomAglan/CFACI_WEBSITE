import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /*
   * =========================
   * LISTE DES UTILISATEURS
   * =========================
   */
  async findAll(query: UserQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const where = search
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
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.user.count({
        where,
      }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /*
   * =========================
   * UTILISATEUR PAR ID
   * =========================
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Utilisateur introuvable',
      );
    }

    return user;
  }

  /*
   * =========================
   * MODIFIER LES INFORMATIONS
   * =========================
   */
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        email: updateUserDto.email,
        phone: updateUserDto.phone,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /*
   * =========================
   * MODIFIER LE STATUT
   * =========================
   */
  async updateStatus(
    id: number,
    status: string,
  ) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /*
   * =========================
   * MODIFIER LE RÔLE
   * =========================
   */
  async updateRole(
    id: number,
    role: string,
  ) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /*
   * =========================
   * VÉRIFIER L'EMAIL
   * =========================
   */
  async verifyEmail(id: number) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        emailVerified: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /*
   * =========================
   * RÉINITIALISER LE MOT DE PASSE
   * =========================
   */
  async resetPassword(
    id: number,
    newPassword: string,
  ) {
    await this.findOne(id);

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12,
    );

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    return {
      message:
        'Le mot de passe de l’utilisateur a été réinitialisé avec succès.',
    };
  }

  /*
   * =========================
   * SUPPRIMER L'UTILISATEUR
   * =========================
   */
  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'Utilisateur supprimé avec succès.',
    };
  }
}