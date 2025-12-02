import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ReorderActsDto {
  @ApiProperty({ description: 'Array of act IDs in the new order' })
  @IsArray()
  @IsString({ each: true })
  actIds: string[];
}
