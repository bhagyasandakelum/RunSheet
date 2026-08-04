import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInvitationDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsOptional()
  @IsString()
  message?: string;
}
