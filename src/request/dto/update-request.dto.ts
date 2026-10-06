import { IsIn } from 'class-validator';

export class UpdateRequestDto {
  @IsIn(['NEW', 'IN_PROGRESS', 'PROCESSED', 'CLOSED'])
  status: string;
}