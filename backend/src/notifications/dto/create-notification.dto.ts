import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsNotEmpty({ message: 'eventMemberId is required' })
  @IsUUID('4', { message: 'eventMemberId must be a valid UUID' })
  eventMemberId: string;

  @IsNotEmpty({ message: 'title is required' })
  @IsString({ message: 'title must be a string' })
  @MaxLength(255, { message: 'title must not exceed 255 characters' })
  title: string;

  @IsNotEmpty({ message: 'message is required' })
  @IsString({ message: 'message must be a string' })
  @MaxLength(3000, { message: 'message must not exceed 3000 characters' })
  message: string;

  @IsNotEmpty({ message: 'notificationType is required' })
  @IsEnum(NotificationType, {
    message: 'notificationType must be a valid NotificationType enum value',
  })
  notificationType: NotificationType;

  @IsOptional()
  @IsUUID('4', { message: 'relatedEventId must be a valid UUID' })
  relatedEventId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'relatedTaskId must be a valid UUID' })
  relatedTaskId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'expiresAt must be a valid ISO date string' })
  expiresAt?: string;
}
