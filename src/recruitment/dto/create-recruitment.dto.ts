import {
  IsIn,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRecruitmentDto {
  @IsString()
  @MaxLength(150)
  title: string;

  @IsString()
  @MaxLength(5000)
  description: string;

  @IsIn([
    'CDI',
    'CDD',
    'STAGE',
    'FREELANCE',
  ])
  contractType: string;

  @IsIn([
    'OPEN',
    'CLOSED',
  ])
  status: string;

  @IsString()
  @MaxLength(150)
  location: string;
}