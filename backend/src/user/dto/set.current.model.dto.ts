import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SetCurrentModelDto {
  @ApiProperty({ example: 1, description: 'Model id to set as current' })
  @IsNumber()
  modelId: number;
}
