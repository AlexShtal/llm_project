import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChatDto {
  @ApiPropertyOptional({
    description: 'Optional title for the new chat',
    maxLength: 120,
  })
  @IsString()
  @IsOptional()
  @MaxLength(120)
  title?: string;
}
