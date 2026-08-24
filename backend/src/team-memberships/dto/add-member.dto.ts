import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddMemberDto {
  @IsOptional()
  @IsUUID('4', { message: 'eventMemberId must be a valid UUID' })
  eventMemberId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId?: string;

  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email?: string;
}
