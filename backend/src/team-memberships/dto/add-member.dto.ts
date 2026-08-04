import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddMemberDto {
  @IsNotEmpty({ message: 'eventMemberId is required' })
  @IsUUID('4', { message: 'eventMemberId must be a valid UUID' })
  eventMemberId: string;
}
