import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  title?: string;
}
