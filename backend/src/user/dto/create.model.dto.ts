import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateModelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  apiOrIP: string;

  @IsString()
  @IsOptional()
  description?: string;
}
