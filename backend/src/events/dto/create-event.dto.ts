import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  eventName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  venue: string;

  @IsNotEmpty()
  @IsDateString({}, { message: 'startDate must be a valid ISO 8601 date string' })
  startDate: string;

  @IsNotEmpty()
  @IsDateString({}, { message: 'endDate must be a valid ISO 8601 date string' })
  endDate: string;
}
