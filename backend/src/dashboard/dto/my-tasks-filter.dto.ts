import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AssignmentStatus, TaskPriority, TaskStatus } from '@prisma/client';

export class MyTasksFilterDto {
  @IsOptional()
  @IsEnum(AssignmentStatus, {
    message: 'status must be a valid AssignmentStatus enum value',
  })
  status?: AssignmentStatus;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'taskStatus must be a valid TaskStatus enum value',
  })
  taskStatus?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, {
    message: 'priority must be a valid TaskPriority enum value',
  })
  priority?: TaskPriority;

  @IsOptional()
  @IsString({ message: 'search must be a string' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'sortBy must be a string' })
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'sortOrder must be asc or desc' })
  sortOrder?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  limit?: number = 10;
}
