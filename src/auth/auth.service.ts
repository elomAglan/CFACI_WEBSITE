import crypto from 'crypto';

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /* =========================
   * INSCRIPTION
   * ========================= */
  async register(registerDto: RegisterDto) {
    const { firstName, lastName, email, phone, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Cette adresse email est déjà utilisée');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
      },
    });

    const { password: _, ...result } = user;

    return result;
  }

  /* =========================
   * CONNEXION
   * ========================= */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        emailVerified: user.emailVerified,
        role: user.role,
      },
    };
  }

  /* =========================
   * PROFIL UTILISATEUR CONNECTÉ
   * ========================= */
  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    return user;
  }

  /* =========================
   * MOT DE PASSE OUBLIÉ
   * ========================= */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message:
          'Si cette adresse email existe, un lien de réinitialisation sera envoyé.',
      };
    }

    const resetToken = crypto.randomUUID();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    return {
      message:
        'Si cette adresse email existe, un lien de réinitialisation sera envoyé.',
      resetToken,
    };
  }

  /* =========================
   * RÉINITIALISER MOT DE PASSE
   * ========================= */
  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Le lien de réinitialisation est invalide ou expiré',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    return {
      message: 'Votre mot de passe a été réinitialisé avec succès',
    };
  }

  /* =========================
   * CHANGER LE MOT DE PASSE
   * ========================= */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const passwordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'Le mot de passe actuel est incorrect',
      );
    }

    if (currentPassword === newPassword) {
      throw new ConflictException(
        'Le nouveau mot de passe doit être différent de l’actuel',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'Votre mot de passe a été modifié avec succès.',
    };
  }
}