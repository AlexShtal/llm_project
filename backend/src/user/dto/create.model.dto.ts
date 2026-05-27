import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateModelDto {
  @ApiProperty({ example: 'gpt-4', description: 'Model name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://api.openai.com/v1/chat/completions', description: 'API endpoint or IP address' })
  @IsString()
  @IsNotEmpty()
  apiOrIP: string;

  @ApiPropertyOptional({ example: 'Custom OpenAI-compatible model', description: 'Optional model description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'openai-compatible', description: 'Provider type or identifier' })
  @IsString()
  @IsNotEmpty()
  provider: string;
}
