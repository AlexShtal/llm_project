import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;
}
