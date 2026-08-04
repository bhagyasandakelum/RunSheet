import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @IsNotEmpty({ message: 'teamName is required' })
  @IsString({ message: 'teamName must be a string' })
  @MaxLength(100, { message: 'teamName must not exceed 100 characters' })
  teamName: string;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(1000, { message: 'description must not exceed 1000 characters' })
  description?: string;
}
