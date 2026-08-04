import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class TaskFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'status must be a valid TaskStatus enum value' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'priority must be a valid TaskPriority enum value' })
  priority?: TaskPriority;

  @IsOptional()
  @IsString({ message: 'search must be a string' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'keyword must be a string' })
  keyword?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dueBefore must be a valid ISO date string' })
  dueBefore?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dueAfter must be a valid ISO date string' })
  dueAfter?: string;

  @IsOptional()
  @IsUUID('4', { message: 'teamId must be a valid UUID' })
  teamId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'eventId must be a valid UUID' })
  eventId?: string;
}
