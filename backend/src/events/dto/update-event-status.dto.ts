import { IsEnum, IsNotEmpty } from 'class-validator';
import { EventStatus } from '@prisma/client';

export class UpdateEventStatusDto {
  @IsNotEmpty()
  @IsEnum(EventStatus, {
    message: 'status must be a valid EventStatus (Draft, Planning, Active, Completed, Cancelled, Archived)',
  })
  status: EventStatus;
}
