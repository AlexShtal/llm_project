import { IsNumber, Min } from 'class-validator';

export class DeleteModelDto {
  @IsNumber()
  @Min(1)
  modelId: number;
}
