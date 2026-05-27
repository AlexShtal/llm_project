import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GenerateDto {
  @ApiProperty({
    description: 'User prompt for the AI model',
    example:
      'Explain the difference between supervised and unsupervised learning.',
  })
  @IsString({ message: 'Prompt must be a string' })
  prompt: string;

  @ApiPropertyOptional({
    description: 'Optional existing chat id to append the prompt to',
    example: 12,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  chatId?: number;

  @ApiPropertyOptional({
    description: 'Optional model id to use for generation',
    example: 3,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  modelId?: number;
}
