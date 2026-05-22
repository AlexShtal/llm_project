import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GenerateDto {
  @IsString({ message: 'Prompt must be a string' })
  prompt: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  chatId?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  modelId?: number;
}
