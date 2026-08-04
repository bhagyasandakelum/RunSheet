import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsDateString } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'taskTitle is required' })
  @IsString({ message: 'taskTitle must be a string' })
  @MaxLength(255, { message: 'taskTitle must not exceed 255 characters' })
  taskTitle: string;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(3000, { message: 'description must not exceed 3000 characters' })
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'priority must be a valid TaskPriority enum value' })
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString({}, { message: 'dueDate must be a valid ISO date string' })
  dueDate?: string;
}
