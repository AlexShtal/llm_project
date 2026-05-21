import { IsNumber } from 'class-validator';

export class SetCurrentModelDto {
  @IsNumber()
  modelId: number;
}
