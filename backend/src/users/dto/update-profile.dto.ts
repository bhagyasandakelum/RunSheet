import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'firstName must be a string' })
  @MaxLength(100, { message: 'firstName must not exceed 100 characters' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'lastName must be a string' })
  @MaxLength(100, { message: 'lastName must not exceed 100 characters' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'phoneNumber must be a string' })
  @MaxLength(20, { message: 'phoneNumber must not exceed 20 characters' })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: 'profilePhotoUrl must be a string' })
  profilePhotoUrl?: string | null;
}
