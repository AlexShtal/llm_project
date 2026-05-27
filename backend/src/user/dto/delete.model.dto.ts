import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class DeleteModelDto {
  @ApiProperty({ example: 1, description: 'Model id to delete' })
  @IsNumber()
  @Min(1)
  modelId: number;
}
