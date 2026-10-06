import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  status: string;
}