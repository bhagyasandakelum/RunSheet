import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignTeamLeaderDto {
  @IsNotEmpty({ message: 'teamMembershipId is required' })
  @IsUUID('4', { message: 'teamMembershipId must be a valid UUID' })
  teamMembershipId: string;
}
