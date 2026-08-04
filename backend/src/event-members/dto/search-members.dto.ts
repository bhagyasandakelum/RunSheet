import { IsOptional, IsString } from 'class-validator';

export class SearchMembersDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
