import { IsNotEmpty, IsUUID } from 'class-validator';

export class TransferMemberDto {
  @IsNotEmpty({ message: 'destinationTeamId is required' })
  @IsUUID('4', { message: 'destinationTeamId must be a valid UUID' })
  destinationTeamId: string;
}
