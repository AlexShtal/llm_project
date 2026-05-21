import { IsString } from 'class-validator';

export class GenerateDto {
  @IsString({ message: 'Prompt must be a string' })
  prompt: string;
}
