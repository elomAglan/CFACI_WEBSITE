import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateRecruitmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsIn([
    'CDI',
    'CDD',
    'STAGE',
    'FREELANCE',
  ])
  contractType?: string;

  @IsOptional()
  @IsIn([
    'OPEN',
    'CLOSED',
  ])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;
}