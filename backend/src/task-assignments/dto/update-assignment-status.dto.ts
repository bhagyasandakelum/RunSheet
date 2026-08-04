import { IsEnum, IsNotEmpty } from 'class-validator';
import { AssignmentStatus } from '@prisma/client';

export class UpdateAssignmentStatusDto {
  @IsNotEmpty({ message: 'assignmentStatus is required' })
  @IsEnum(AssignmentStatus, {
    message: 'assignmentStatus must be a valid AssignmentStatus enum value',
  })
  assignmentStatus: AssignmentStatus;
}
