import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendAnnouncementDto {
  @IsNotEmpty({ message: 'title is required' })
  @IsString({ message: 'title must be a string' })
  @MaxLength(255, { message: 'title must not exceed 255 characters' })
  title: string;

  @IsNotEmpty({ message: 'message is required' })
  @IsString({ message: 'message must be a string' })
  @MaxLength(3000, { message: 'message must not exceed 3000 characters' })
  message: string;
}
