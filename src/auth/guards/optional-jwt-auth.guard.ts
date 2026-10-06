import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(
    err: any,
    user: any,
    info: any,
  ) {
    // Pas de token : on autorise quand même l'accès
    if (!user) {
      return null;
    }

    // Token présent mais invalide
    if (err) {
      throw err;
    }

    return user;
  }
}