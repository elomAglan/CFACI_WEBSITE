import { IsIn } from 'class-validator';

export class UpdateRoleDto {
  @IsIn(['CLIENT', 'ADMIN'])
  role: string;
}